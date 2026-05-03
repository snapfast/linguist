import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private languageDataUrl = environment.languageDataUrl;

  constructor(private http: HttpClient) { }

  // Method to send POST request
  sendData(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain;charset=utf-8'
    });
    return this.http.post(this.languageDataUrl, JSON.stringify(data), { headers });
  }
  
  // Method to send GET request
  getData(): Observable<any> {
    return this.http.get(this.languageDataUrl);
  }

}