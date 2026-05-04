import { Component, signal, OnInit, OnDestroy, inject, ElementRef, viewChildren, effect, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EtymologyService } from '../../service/etymology.service';
import { animate, stagger } from 'motion';

interface WordNode {
  text: string;
  x: number;
  y: number;
  id: number;
}

@Component({
  selector: 'app-words',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit, OnDestroy {
  private etymologyService = inject(EtymologyService);
  private platformId = inject(PLATFORM_ID);

  private allWords = [
    'etymology', 'philology', 'lexicon', 'semantics', 'syntax', 'morphology',
    'phonology', 'cognate', 'derivation', 'root', 'prefix', 'suffix', 'archaic',
    'neologism', 'jargon', 'dialect', 'vernacular', 'glossary', 'thesaurus',
    'dictionary', 'language', 'speech', 'alphabet', 'glyph', 'runes', 'script',
    'parchment', 'scroll', 'codex', 'manuscript', 'scribe', 'literature',
    'poetry', 'prose', 'metaphor', 'simile', 'allegory', 'symbol', 'myth',
    'legend', 'folklore', 'tradition', 'culture', 'history', 'ancient',
    'modern', 'future', 'cosmos', 'philosophy', 'wisdom', 'knowledge'
  ];

  displayedWords = signal<WordNode[]>([]);
  private refreshInterval: any;
  private nextId = 0;

  wordElements = viewChildren<ElementRef>('wordEl');

  constructor() {
    effect(() => {
      const elements = this.wordElements();
      if (isPlatformBrowser(this.platformId) && elements.length > 0) {
        animate(
          elements.map(el => el.nativeElement),
          {
            opacity: [0, 1],
            scale: [0.5, 1],
            y: [20, 0]
          },
          {
            delay: stagger(0.05),
            duration: 0.5
          }
        );

        // Continuous floating animation
        elements.forEach((el, i) => {
          animate(
            el.nativeElement,
            {
              x: [0, Math.sin(i) * 10, 0],
              y: [0, Math.cos(i) * 10, 0]
            },
            {
              duration: 3 + Math.random() * 2,
              repeat: Infinity
            }
          );
        });
      }
    });
  }

  ngOnInit() {
    this.refreshWords();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshInterval = setInterval(() => this.refreshWords(), 15000);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  refreshWords() {
    const shuffled = [...this.allWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12).map(word => ({
      text: word,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      id: this.nextId++
    }));
    this.displayedWords.set(selected);
  }

  handleWordClick(word: WordNode) {
    this.etymologyService.getEtymology(word.text).subscribe(etymology => {
      const parts = etymology.split(/\s+/)
        .map(w => w.replace(/[.,();]/g, '').toLowerCase())
        .filter(w => w.length > 3 && /^[a-z]+$/.test(w));

      const uniqueLinks = Array.from(new Set(parts)).slice(0, 5);

      // Add linked words around the clicked word
      const newWords: WordNode[] = uniqueLinks.map((w, i) => {
        const angle = (i / uniqueLinks.length) * 2 * Math.PI;
        const radius = 20;
        return {
          text: w,
          x: word.x + Math.cos(angle) * radius,
          y: word.y + Math.sin(angle) * radius,
          id: this.nextId++
        };
      });

      // Update displayed words: keep some current ones and add new ones
      const current = this.displayedWords();
      this.displayedWords.set([...current, ...newWords].slice(-20));
    });
  }
}
