import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { SignupRequest, UserService } from '../../../services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    HttpClientModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
    signupForm!: FormGroup;
    photoPreview: string | ArrayBuffer | null = null;
    selectedFileName: string | null = null;

    countriesAndCities: { [key: string]: string[] } = {
        'United States': ['New York', 'Los Angeles', 'Chicago'],
        'United Kingdom': ['London', 'Manchester', 'Birmingham'],
        'Turkey': ['Istanbul', 'Ankara', 'Izmir'],
        'Germany': ['Berlin', 'Hamburg', 'Munich'],
        'Canada': ['Toronto', 'Vancouver', 'Montreal']
    };

    countries: string[] = [];
    availableCities: string[] = [];

    constructor(private fb: FormBuilder, private router: Router, private userService: UserService) {}

    ngOnInit(): void {
        const passwordPattern = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
        
        this.countries = Object.keys(this.countriesAndCities);

        this.signupForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(passwordPattern)]],
        confirmPassword: ['', Validators.required],
        country: ['', Validators.required],
        city: ['', Validators.required],
        photo: [null]
        }, { validators: this.passwordMatchValidator });

        this.onCountryChange();
    }

    get email() { return this.signupForm.get('email'); }
    get password() { return this.signupForm.get('password'); }
    get confirmPassword() { return this.signupForm.get('confirmPassword'); }
    get country() { return this.signupForm.get('country'); }
    get city() { return this.signupForm.get('city'); }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ mustMatch: true });
        } else {
            if (confirmPassword?.hasError('mustMatch')) {
            confirmPassword.setErrors(null);
            }
        }
        return null;
    }

    onCountryChange(): void {
        this.country?.valueChanges.subscribe(selectedCountry => {
            this.availableCities = [];
            this.city?.reset({ value: '', disabled: true });

            if (selectedCountry) {
                this.availableCities = this.countriesAndCities[selectedCountry] || [];
                this.city?.enable();
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            this.selectedFileName = file.name;
            this.signupForm.patchValue({ photo: file });

            const reader = new FileReader();
            reader.onload = () => {
                this.photoPreview = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit(): void {
      if (this.signupForm.invalid) {
          this.signupForm.markAllAsTouched();
          return;
      }
      const formValues = this.signupForm.value;
      const payload: SignupRequest = {
        email: formValues.email,
        password: formValues.password,
        country: formValues.country,
        city: formValues.city,
        photoUrl: typeof this.photoPreview === 'string' ? this.photoPreview : null
      };

      this.userService.signup(payload).subscribe({
      next: (response) => {
        console.log('Registration successful!', response); 
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error('Registration failed:', err);
      }
    });
    }

    public goToLogin(): void {
      this.router.navigate(['/login']);
    }

    public goToHome(): void {
      this.router.navigate(['/']);
    }
}