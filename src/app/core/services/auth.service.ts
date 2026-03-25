import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000/api';
  private isAuthenticated = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient) { }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('is_superuser', res.is_superuser);
        this.isAuthenticated.next(true);
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_superuser');
    this.isAuthenticated.next(false);
  }

  changePassword(newPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/user/change_password`,
      { new_password: newPassword },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
  }

  generateResetLink(userId: number) {
    return this.http.post<any>(`${this.apiUrl}/admin/generate_reset_link`,
      { user_id: userId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
  }

  resetPasswordWithToken(token: string, newPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/user/reset_password_with_token`, {
      token: token,
      new_password: newPassword
    });
  }

  getUsersList() {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUsername() {
    return localStorage.getItem('username');
  }

  isSuperUser() {
    return localStorage.getItem('is_superuser') === 'true';
  }
}
