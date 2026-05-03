import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EtymologyService } from '../../service/etymology.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  searchTerm = '';
  history = signal<string[]>([]);
  currentEtymology = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  parsedEtymology = computed(() => {
    const text = this.currentEtymology();
    return text.split(/(\s+)/).map(part => {
      const isWord = /^[a-zA-Z]+$/.test(part.replace(/[.,();]/g, ''));
      return {
        text: part,
        isClickable: isWord
      };
    });
  });

  constructor(private etymologyService: EtymologyService) {}

  search(word?: string) {
    const wordToSearch = word || this.searchTerm.trim();
    if (!wordToSearch) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.etymologyService.getEtymology(wordToSearch).subscribe({
      next: (etymology) => {
        this.currentEtymology.set(etymology);
        const currentHistory = this.history();
        if (!currentHistory.includes(wordToSearch)) {
          this.history.set([...currentHistory, wordToSearch]);
        } else {
          this.history.set([...currentHistory.filter(w => w !== wordToSearch), wordToSearch]);
        }
        this.searchTerm = '';
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to fetch etymology. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  handleWordClick(word: string) {
    const cleanWord = word.replace(/[.,();]/g, '').toLowerCase();
    this.search(cleanWord);
  }
}
