import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, Subject, Subscription, switchMap, tap } from "rxjs";
import { AuthService, AuthUser } from "../../services/auth.service";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Movie, MovieService } from "../../services/movie.service";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, TranslateModule, ReactiveFormsModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
    isLoggedIn = false;
    userEmail: string | null = null;
    private authSubscription!: Subscription;

    searchControl = new FormControl('');
    searchCategory = new FormControl('all');
    searchResults$: Observable<{ movies: Movie[], actors: string[] }>;
    isSearchLoading = false;
    showResults = false;
    
    private searchTerms = new Subject<string>();

    constructor(
        private router: Router,
        public translate: TranslateService,
        private authService: AuthService,
        private movieService: MovieService
    ) {
        this.searchResults$ = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap((term) => {
                if (term.length >= 3) {
                    this.isSearchLoading = true;
                }
            }),
            switchMap((term: string) => {
                if (term.length < 3) {
                    return of([] as Movie[]);
                }
                return this.movieService.searchMovies(term).pipe(
                    catchError(() => of([] as Movie[]))
                );
            }),
            map((movies: Movie[]) => {
                this.isSearchLoading = false;
                const allActors = new Set<string>();
                movies.forEach(movie => {
                    movie.actors.forEach((actor: string) => allActors.add(actor));
                });
                return {
                    movies: movies.slice(0, 3),
                    actors: Array.from(allActors).slice(0, 3)
                };
            })
        );
    }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe((user: AuthUser | null) => {
      this.isLoggedIn = !!user;
      this.userEmail = user ? user.email : null;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

    search(event: Event): void {
        const term = (event.target as HTMLInputElement).value;
        this.searchTerms.next(term);
    }

    onSearchFocus(): void {
        if (this.searchControl.value && this.searchControl.value.length >= 3) {
            this.showResults = true;
        }
    }

    goToMovieDetail(movieId: number): void {
        this.showResults = false;
        this.searchControl.setValue('');
        this.router.navigate(['/movie', movieId]);
    }

    goToActorPage(actorName: string): void {
        this.showResults = false;
        this.searchControl.setValue('');
    }

    public changeLanguage(event: Event): void {
      const selectElement = event.target as HTMLSelectElement;
      const lang = selectElement.value;

      this.translate.use(lang);

      localStorage.setItem('language', lang);
    }

    public logout(): void {
      this.authService.logout();
    }

    public goToLogin(): void {
      this.router.navigate(['/login']);
    }

    public goToHome(): void {
      this.router.navigate(['/']);
    }

    public goToWatchlist(): void {
      if (this.isLoggedIn) {
        this.router.navigate(['/watchlist']);
      } else {
        this.router.navigate(['/login']);
      }
    }
}