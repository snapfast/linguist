import { Component, signal, OnInit, OnDestroy, inject, ElementRef, viewChildren, effect, PLATFORM_ID, afterNextRender, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EtymologyService } from '../../service/etymology.service';
import { animate, stagger } from 'motion';

interface WordNode {
  text: string;
  x: number;
  y: number;
  id: number;
  parentId?: number;
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
  connections = computed(() => {
    const words = this.displayedWords();
    return words
      .filter(w => w.parentId !== undefined)
      .map(w => {
        const parent = words.find(p => p.id === w.parentId);
        return parent ? { x1: parent.x, y1: parent.y, x2: w.x, y2: w.y } : null;
      })
      .filter(c => c !== null) as { x1: number, y1: number, x2: number, y2: number }[];
  });
  selectedWord = signal<WordNode | null>(null);
  selectedEtymology = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  private refreshInterval: any;
  private nextId = 0;

  wordElements = viewChildren<ElementRef>('wordEl');

  private animatedIds = new Set<number>();

  constructor() {
    effect(() => {
      const elements = this.wordElements();
      const words = this.displayedWords();

      if (isPlatformBrowser(this.platformId) && elements.length > 0) {
        const newElements = elements.filter((el, index) => {
          const word = words[index];
          if (word && !this.animatedIds.has(word.id)) {
            this.animatedIds.add(word.id);
            return true;
          }
          return false;
        });

        if (newElements.length > 0) {
          animate(
            newElements.map(el => el.nativeElement),
            {
              opacity: [0, 1],
              scale: [0, 1.2, 1],
            },
            {
              delay: stagger(0.1),
              duration: 0.6,
              // @ts-ignore
              ease: 'easeOut'
            }
          );

          newElements.forEach((el, i) => {
            animate(
              el.nativeElement,
              {
                x: [0, Math.sin(i) * 10, 0],
                y: [0, Math.cos(i) * 10, 0]
              },
              {
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                // @ts-ignore
                ease: 'easeInOut'
              }
            );
          });
        }
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

  refreshWords(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.closeFragment();
    this.animatedIds.clear();
    const shuffled = [...this.allWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 12).map(word => ({
      text: word,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      id: this.nextId++
    }));
    this.displayedWords.set(selected);
  }

  handleWordClick(word: WordNode, event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedWord()?.id === word.id) {
      this.selectedWord.set(null);
      this.selectedEtymology.set(null);
      return;
    }

    this.selectedWord.set(word);
    this.isLoading.set(true);

    this.etymologyService.getEtymology(word.text).subscribe(etymology => {
      this.selectedEtymology.set(etymology);
      this.isLoading.set(false);

      const parts = etymology.split(/\s+/)
        .map(w => w.replace(/[.,();]/g, '').toLowerCase())
        .filter(w => w.length > 3 && /^[a-z]+$/.test(w));

      const uniqueLinks = Array.from(new Set(parts))
        .filter(w => !this.displayedWords().some(dw => dw.text === w))
        .slice(0, 5);

      // Add linked words around the clicked word
      const newWords: WordNode[] = uniqueLinks.map((w, i) => {
        const angle = (i / uniqueLinks.length) * 2 * Math.PI;
        const radius = 15; // Closer for a "sprout" look
        return {
          text: w,
          x: Math.max(5, Math.min(95, word.x + Math.cos(angle) * radius)),
          y: Math.max(5, Math.min(90, word.y + Math.sin(angle) * radius)),
          id: this.nextId++,
          parentId: word.id
        };
      });

      // Update displayed words: keep some current ones and add new ones
      const current = this.displayedWords();
      this.displayedWords.set([...current, ...newWords].slice(-25));
    });
  }

  closeFragment() {
    this.selectedWord.set(null);
    this.selectedEtymology.set(null);
  }
}
