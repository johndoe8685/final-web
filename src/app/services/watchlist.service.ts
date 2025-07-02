import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from './movie.service';
@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getWatchlist(userId: number): Observable<Movie[]> {
    const url = `${this.baseUrl}/users/${userId}/watchlist`;
    return this.http.get<Movie[]>(url);
  }

  addToWatchlist(userId: number, movieId: number): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}/watchlist/${movieId}`;
    return this.http.post(url, {}); // Body boş gidiyor
  }

  removeFromWatchlist(userId: number, movieId: number): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}/watchlist/${movieId}`;
    return this.http.delete(url);
  }
}