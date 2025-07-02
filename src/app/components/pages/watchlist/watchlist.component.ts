import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs'; // of'u import et
import { HeaderComponent } from '../../header/header.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WatchlistService } from '../../../services/watchlist.service';
import { Movie } from '../../../services/movie.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterModule, TranslateModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  watchlist$!: Observable<Movie[]>;

  constructor(
    private watchlistService: WatchlistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      this.watchlist$ = this.watchlistService.getWatchlist(currentUser.id);
    } else {
      this.watchlist$ = of([]); 
    }
  }
}