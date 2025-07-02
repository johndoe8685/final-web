import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { LoginComponent } from './components/pages/login/login.component';
import { SignupComponent } from './components/pages/signup/signup.component';
import { MovieDetailComponent } from './components/pages/movieDetail/movie-detail.component';
import { WatchlistComponent } from './components/pages/watchlist/watchlist.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'movie/:id', component: MovieDetailComponent },
    {path: 'watchlist', component: WatchlistComponent}
];
