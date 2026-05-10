import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { EtymologyService } from '../../service/etymology.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let etymologyService: EtymologyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        EtymologyService
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    etymologyService = TestBed.inject(EtymologyService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('search', () => {
    it('should update currentEtymology and history on success', () => {
      const mockEtymology = 'Derived from Latin.';
      spyOn(etymologyService, 'getEtymology').and.returnValue(of(mockEtymology));

      component.searchTerm = 'test';
      component.search();

      expect(component.currentEtymology()).toBe(mockEtymology);
      expect(component.history()).toContain('test');
      expect(component.isLoading()).toBeFalse();
      expect(component.error()).toBeNull();
      expect(component.searchTerm).toBe('');
    });

    it('should update error and isLoading on failure', () => {
      spyOn(etymologyService, 'getEtymology').and.returnValue(throwError(() => new Error('API Error')));

      component.searchTerm = 'test';
      component.search();

      expect(component.error()).toBe('Failed to fetch etymology. Please try again.');
      expect(component.isLoading()).toBeFalse();
      expect(component.currentEtymology()).toBe('');
    });

    it('should not search if term is empty', () => {
      const etymologySpy = spyOn(etymologyService, 'getEtymology');

      component.searchTerm = '   ';
      component.search();

      expect(etymologySpy).not.toHaveBeenCalled();
    });

    it('should handle history updates correctly (move existing to end)', () => {
      spyOn(etymologyService, 'getEtymology').and.returnValue(of('some response'));

      component.history.set(['apple', 'banana']);

      component.search('apple');
      expect(component.history()).toEqual(['banana', 'apple']);

      component.search('cherry');
      expect(component.history()).toEqual(['banana', 'apple', 'cherry']);
    });
  });

  describe('handleWordClick', () => {
    it('should clean word and call search', () => {
      const searchSpy = spyOn(component, 'search');

      component.handleWordClick('Hello');
      expect(searchSpy).toHaveBeenCalledWith('hello');

      component.handleWordClick('Latin,');
      expect(searchSpy).toHaveBeenCalledWith('latin');

      component.handleWordClick('(Greek);');
      expect(searchSpy).toHaveBeenCalledWith('greek');

      component.handleWordClick('Etymology...');
      expect(searchSpy).toHaveBeenCalledWith('etymology');
    });
  });
});
