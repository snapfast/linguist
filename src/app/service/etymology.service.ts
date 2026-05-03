import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EtymologyService {
  private apiUrl = 'https://en.wiktionary.org/w/api.php';

  constructor(private http: HttpClient) {}

  getEtymology(word: string): Observable<string> {
    const params = {
      action: 'query',
      prop: 'extracts',
      titles: word,
      format: 'json',
      explaintext: '1',
      origin: '*'
    };

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        const pages = response.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === '-1') {
          return 'Word not found.';
        }
        const extract = pages[pageId].extract;
        return this.parseEtymology(extract);
      })
    );
  }

  private parseEtymology(extract: string): string {
    // Basic parser to find the English Etymology section
    const lines = extract.split('\n');
    let inEnglish = false;
    let inEtymology = false;
    let etymologyText = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '== English ==') {
        inEnglish = true;
        continue;
      }

      if (inEnglish && line.startsWith('== ') && line !== '== English ==') {
        // Entered another language section
        break;
      }

      if (inEnglish && line.startsWith('=== Etymology')) {
        inEtymology = true;
        continue;
      }

      if (inEtymology && line.startsWith('===') && !line.startsWith('====')) {
        // Entered another L3 subsection under English
        break;
      }

      if (inEtymology) {
        etymologyText += line + ' ';
      }
    }

    return etymologyText.trim() || 'Etymology not found for English entry.';
  }
}
