import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SignupRequest {
  email: string;
  password: string;
  country: string;
  city: string;
  photoUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  signup(data: SignupRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signup`, data);
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signin`, data);
  }
}
