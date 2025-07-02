import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Movie, MovieService } from '../../../services/movie.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { HeaderComponent } from '../../header/header.component';
import { forkJoin, Observable, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { WatchlistService } from '../../../services/watchlist.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TranslateModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | undefined;
  safeTrailerUrl: SafeResourceUrl | undefined;
  showRatingDetails = false;
  isLoggedIn$: Observable<boolean>;
  isInWatchlist = false;

  popularityScore = 0;
  popularityRank = 0;
  ratingDistribution: { country: string, count: number, percentage: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private watchlistService: WatchlistService
  ) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }


  ngOnInit(): void {
    let currentMovieId: number;
    const currentUser = this.authService.currentUserValue;

    this.route.paramMap.pipe(
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.router.navigate(['/home']);
          return [];
        }
        currentMovieId = Number(idParam);

        return forkJoin({
          movie: this.movieService.getMovieById(currentMovieId),
          allMovies: this.movieService.getMovies(),
          watchlist: currentUser
            ? this.watchlistService.getWatchlist(currentUser.id).pipe(
                catchError(() => of([] as Movie[])) 
              ) 
            : of([] as Movie[])
        });
      }),
      tap(results => {
        const { movie, allMovies, watchlist } = results;

        if (movie && allMovies) {
          this.movie = movie;
          this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.movie.trailerUrl);
          this.calculatePopularity(movie, allMovies);
          this.calculateRatingDistribution(movie);
          if (watchlist && watchlist.length > 0) {
            this.isInWatchlist = watchlist.some(m => m.id === currentMovieId);
          }
        } else {
          this.router.navigate(['/home']);
        }
      })
    ).subscribe({
      error: err => {
        console.error('Film detayları veya izleme listesi getirilirken hata:', err);
        this.router.navigate(['/home']);
      }
    });
  }

  calculatePopularity(currentMovie: Movie, allMovies: Movie[]): void {
    const movieScores = allMovies.map(m => {
      const commentCount = m.comments ? m.comments.length : 0;
      const score = (m.rating * 20) + (commentCount * 5);
      return { id: m.id, score: score };
    });

    movieScores.sort((a, b) => b.score - a.score);

    const currentMovieScore = movieScores.find(s => s.id === currentMovie.id);
    const currentMovieRank = movieScores.findIndex(s => s.id === currentMovie.id) + 1;

    this.popularityScore = Math.round(currentMovieScore?.score || 0);
    this.popularityRank = currentMovieRank > 0 ? currentMovieRank : -1;
  }
  
  calculateRatingDistribution(currentMovie: Movie): void {
    if (!currentMovie.comments || currentMovie.comments.length === 0) return;

    const totalComments = currentMovie.comments.length;
    const countsByCountry: { [country: string]: number } = {};

    for (const comment of currentMovie.comments) {
      countsByCountry[comment.country] = (countsByCountry[comment.country] || 0) + 1;
    }

    this.ratingDistribution = Object.keys(countsByCountry).map(country => {
      const count = countsByCountry[country];
      return {
        country: country,
        count: count,
        percentage: (count / totalComments) * 100
      };
    }).sort((a, b) => b.count - a.count);
  }

  toggleWatchlist(): void {
    if (!this.movie) return;
    this.authService.currentUser$.pipe(take(1)).subscribe(currentUser => {

      if (!currentUser) {
        console.error("User not logged in!");
        this.router.navigate(['/login']);
        return;
      }

      const movieId = this.movie!.id;
      const userId = currentUser.id;

      if (this.isInWatchlist) {
        this.watchlistService.removeFromWatchlist(userId, movieId).subscribe(() => {
          this.isInWatchlist = false;
        });
      } else {
        this.watchlistService.addToWatchlist(userId, movieId).subscribe(() => {
          this.isInWatchlist = true;
        });
      }
    });
  }

  toggleRatingDetails(): void {
    this.showRatingDetails = !this.showRatingDetails;
  }
}