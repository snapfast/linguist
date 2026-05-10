import { Component, signal, OnInit, OnDestroy, inject, ElementRef, viewChildren, effect, PLATFORM_ID, afterNextRender, computed, viewChild } from '@angular/core';
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

  private wordClusters: Record<string, string[]> = {
    linguistics: [
      'etymology', 'philology', 'lexicon', 'semantics', 'syntax', 'morphology',
      'phonology', 'cognate', 'derivation', 'root', 'prefix', 'suffix', 'archaic',
      'neologism', 'jargon', 'dialect', 'vernacular', 'glossary', 'thesaurus',
      'dictionary', 'language', 'speech'
    ],
    writing: [
      'alphabet', 'glyph', 'runes', 'script', 'parchment', 'scroll', 'codex',
      'manuscript', 'scribe', 'ink', 'quill', 'papyrus', 'vellum'
    ],
    literature: [
      'literature', 'poetry', 'prose', 'metaphor', 'simile', 'allegory',
      'symbol', 'myth', 'legend', 'folklore', 'narrative', 'epic'
    ],
    philosophy: [
      'tradition', 'culture', 'history', 'ancient', 'modern', 'future',
      'cosmos', 'philosophy', 'wisdom', 'knowledge', 'ontology', 'logic'
    ]
  };

  displayedWords = signal<WordNode[]>([]);
  connections = computed(() => {
    const words = this.displayedWords();
    const fragments = this.activeFragments();
    const discovered = this.discoveredLinks();
    const conns: { x1: number, y1: number, x2: number, y2: number, active?: boolean, discovered?: boolean }[] = [];

    // Parent-child links
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

    // Discovered links
    discovered.forEach(link => {
      const [id1, id2] = link.split('-').map(Number);
      const w1 = words.find(w => w.id === id1);
      const w2 = words.find(w => w.id === id2);
      if (w1 && w2) {
        conns.push({
          x1: w1.x,
          y1: w1.y,
          x2: w2.x,
          y2: w2.y,
          active: fragments.has(w1.id) || fragments.has(w2.id),
          discovered: true
        });
      }
    });

    return conns;
  });

  relatedWordIds = computed(() => {
    const fragments = this.activeFragments();
    const words = this.displayedWords();
    const discovered = this.discoveredLinks();
    const related = new Set<number>();

    fragments.forEach((frag, wordId) => {
      // Find parent/children
      const self = words.find(s => s.id === wordId);
      words.forEach(w => {
        if (w.parentId === wordId) related.add(w.id);
        if (self && self.parentId === w.id) related.add(w.id);
      });

      // Find discovered links
      discovered.forEach(link => {
        const [id1, id2] = link.split('-').map(Number);
        if (id1 === wordId) related.add(id2);
        if (id2 === wordId) related.add(id1);
      });
    });

    return related;
  });
  activeFragments = signal<Map<number, { word: WordNode, etymology: string | null, tokens: string[], isLoading: boolean, leftPx?: number, topPx?: number }>>(new Map());
  discoveredLinks = signal<Set<string>>(new Set());

  private refreshInterval: any;
  private nextId = 0;

  wordElements = viewChildren<ElementRef>('wordEl');
  container = viewChild<ElementRef>('container');

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
    this.discoveredLinks.set(new Set());

    const categories = Object.keys(this.wordClusters);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const clusterWords = this.wordClusters[category];

    const shuffled = [...clusterWords].sort(() => 0.5 - Math.random());
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

    // Calculate position
    const pos = this.calculateFragmentPosition(word);

    // Add new fragment in loading state
    fragments.set(word.id, { word, etymology: null, tokens: [], isLoading: true, ...pos });
    this.activeFragments.set(new Map(fragments));

    this.etymologyService.getEtymology(word.text).subscribe(etymology => {
      const tokens = etymology.split(/(\s+)/);
      const updatedFragments = new Map(this.activeFragments());
      const existing = updatedFragments.get(word.id);
      if (existing) {
        updatedFragments.set(word.id, { ...existing, etymology, tokens, isLoading: false });
        this.activeFragments.set(updatedFragments);

        // Link with other displayed words found in etymology
        const displayed = this.displayedWords();
        const currentLinks = new Set(this.discoveredLinks());
        let linksAdded = false;
        const lowerEtymology = etymology.toLowerCase();

        displayed.forEach(other => {
          if (other.id !== word.id && lowerEtymology.includes(other.text.toLowerCase())) {
            const link = [word.id, other.id].sort((a, b) => a - b).join('-');
            if (!currentLinks.has(link)) {
              currentLinks.add(link);
              linksAdded = true;
            }
          }
        });

        if (linksAdded) {
          this.discoveredLinks.set(new Set(currentLinks));
        }
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

  private calculateFragmentPosition(word: WordNode): { leftPx: number, topPx: number } {
    const containerEl = this.container()?.nativeElement;
    const rect = containerEl ? containerEl.getBoundingClientRect() : { width: 1200, height: 800 };

    const wordX = (word.x / 100) * rect.width;
    const wordY = (word.y / 100) * rect.height;

    // Approximating card dimensions including padding and shadows
    const CARD_WIDTH = 360;
    const CARD_HEIGHT = 250;
    const OFFSET = 60;

    let left = wordX + OFFSET;
    let top = wordY + OFFSET;

    // Push sideways if overlapping with existing fragments
    const activeFrags = Array.from(this.activeFragments().values());
    let collision = true;
    let attempts = 0;

    while (collision && attempts < 20) {
      collision = false;
      for (const frag of activeFrags) {
        if (frag.leftPx !== undefined && frag.topPx !== undefined) {
          const dx = Math.abs(left - frag.leftPx);
          const dy = Math.abs(top - frag.topPx);
          if (dx < CARD_WIDTH && dy < CARD_HEIGHT) {
            collision = true;
            left += 50; // Push sideways
            top += 30;  // And slightly down
            break;
          }
        }
      }

      if (left + CARD_WIDTH > rect.width - 40) {
        left = 40;
        top += 40;
      }
      if (top + CARD_HEIGHT > rect.height - 40) {
        top = 40;
      }
      attempts++;
    }

    // Boundary clamping
    if (left + CARD_WIDTH > rect.width - 20) left = Math.max(20, rect.width - CARD_WIDTH - 20);
    if (top + CARD_HEIGHT > rect.height - 20) top = Math.max(20, rect.height - CARD_HEIGHT - 20);
    if (left < 20) left = 20;
    if (top < 20) top = 20;

    return { leftPx: left, topPx: top };
  }
}
