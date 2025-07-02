import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HeaderComponent } from "../../header/header.component";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginRequest, UserService } from "../../../services/user.service";
import { AuthService, AuthUser } from "../../../services/auth.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [TranslateModule, CommonModule, ReactiveFormsModule],
    standalone: true
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private router: Router, private fb: FormBuilder, private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

public onSubmit(): void {
    this.errorMessage = null;
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData: LoginRequest = this.loginForm.value;
      
      this.userService.login(loginData).subscribe({
          next: (response) => {
              console.log('Login successful, response from backend:', response);
              this.isLoading = false;
              if (response.userId && response.email) {
                const userToAuth: AuthUser = {
                  id: response.userId,
                  email: response.email
                };
                this.authService.login(userToAuth);
                this.router.navigate(['/']);
              } else {
                this.errorMessage = 'Login failed due to an unexpected server response.';
              }
          },
          error: (err) => {
              console.error('Login failed:', err);
              this.isLoading = false;
              this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
          }
      });
    }
  }

  public goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  public goToHome(): void {
    this.router.navigate(['/']);
  }
}