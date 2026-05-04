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
    const fragments = this.activeFragments();
    const conns: { x1: number, y1: number, x2: number, y2: number, active?: boolean }[] = [];

    words.forEach(w => {
      if (w.parentId !== undefined) {
        const parent = words.find(p => p.id === w.parentId);
        if (parent) {
          conns.push({
            x1: parent.x,
            y1: parent.y,
            x2: w.x,
            y2: w.y,
            active: fragments.has(w.id) || fragments.has(parent.id)
          });
        }
      }
    });

    return conns;
  });
  activeFragments = signal<Map<number, { word: WordNode, etymology: string | null, tokens: string[], isLoading: boolean }>>(new Map());

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
  }

  ngOnDestroy() {
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

  handleWordClick(word: WordNode, event: MouseEvent, forceOpen = false) {
    event.stopPropagation();
    const fragments = new Map(this.activeFragments());

    if (fragments.has(word.id) && !forceOpen) {
      fragments.delete(word.id);
      this.activeFragments.set(fragments);
      return;
    }

    // Add new fragment in loading state
    fragments.set(word.id, { word, etymology: null, tokens: [], isLoading: true });
    this.activeFragments.set(new Map(fragments));

    this.etymologyService.getEtymology(word.text).subscribe(etymology => {
      const tokens = etymology.split(/(\s+)/);
      const updatedFragments = new Map(this.activeFragments());
      if (updatedFragments.has(word.id)) {
        updatedFragments.set(word.id, { word, etymology, tokens, isLoading: false });
        this.activeFragments.set(updatedFragments);
      }
    });
  }

  isClickable(token: string): boolean {
    const clean = token.replace(/[.,();]/g, '').toLowerCase();
    return clean.length > 3 && /^[a-z]+$/.test(clean) && this.displayedWords().some(w => w.text === clean);
  }

  handleTokenClick(token: string, parentWord: WordNode, event: MouseEvent) {
    event.stopPropagation();
    const clean = token.replace(/[.,();]/g, '').toLowerCase();

    // Check if the word is already on the board
    const existing = this.displayedWords().find(w => w.text === clean);

    if (existing) {
      this.handleWordClick(existing, event, true);
    }
  }

  closeFragment(id?: number) {
    if (id !== undefined) {
      const fragments = new Map(this.activeFragments());
      fragments.delete(id);
      this.activeFragments.set(fragments);
    } else {
      this.activeFragments.set(new Map());
    }
  }
}
