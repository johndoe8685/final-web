import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Bu interface backend'deki DTO ile birebir aynı, o yüzden bir değişiklik yok. Mükemmel.
export interface Movie {
    id: number;
    title: string;
    description: string;
    actors: string[];
    posterUrl: string;
    trailerUrl: string;
    rating: number;
    comments: { user: string; text: string; country: string }[];
}

@Injectable({
    providedIn: 'root'
})
export class MovieService {
    private baseUrl = `http://localhost:8080/api/movies`;

    constructor(private http: HttpClient) {}

    getMovies(): Observable<Movie[]> {
        return this.http.get<Movie[]>(this.baseUrl);
    }

    getMovieById(id: number): Observable<Movie> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.get<Movie>(url);
    }

    searchMovies(term: string): Observable<Movie[]> {
        if (!term.trim()) {
            return new Observable<Movie[]>(observer => {
                observer.next([]);
                observer.complete();
            });
        }
        const params = new HttpParams().set('search', term);
        
        return this.http.get<Movie[]>(this.baseUrl, { params: params });
    }
}