import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, of, EMPTY } from "rxjs";
import { catchError } from 'rxjs/operators';
import { HeaderComponent } from "../../header/header.component";
import { MovieService, Movie } from "../../../services/movie.service";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [CommonModule, TranslateModule, HeaderComponent]
})
export class HomeComponent implements OnInit {
    movies$!: Observable<Movie[]>;
    isLoading = true;
    errorMessage: string | null = null;

    constructor(private router: Router, private movieService: MovieService) {}

    ngOnInit(): void {
        this.movies$ = this.movieService.getMovies().pipe(
            catchError(err => {
                console.error('Error fetching movies:', err);
                this.errorMessage = 'Could not load movies. Please try again later.';
                this.isLoading = false;
                return EMPTY;
            })
        );

        this.movies$.subscribe({
            next: () => this.isLoading = false,
        });
    }

    goToMovieDetail(id: number): void {
      this.router.navigate(['/movie', id]);
    }
}