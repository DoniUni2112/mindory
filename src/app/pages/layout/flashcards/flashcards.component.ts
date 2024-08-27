import { Component, OnDestroy, OnInit } from '@angular/core';
import { LessonContentComponent } from './components/lesson-content/lesson-content.component';
import { ViewComponent } from './components/view/view.component';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import * as FlashcardActions from '../../../ngrx/flashcard/flashcard.actions';
import { Store } from '@ngrx/store';
import { FlashcardState } from '../../../ngrx/flashcard/flashcard.state';
import { AuthState } from '../../../ngrx/auth/auth.state';
import { ActivatedRoute } from '@angular/router';
import { FlashcardModel } from '../../../models/flashcard.model';
import { CardModel } from '../../../models/card.model';
import { ProfileState } from '../../../ngrx/profile/profile.state';
import { Profile } from '../../../models/profile.model';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [LessonContentComponent, ViewComponent, MatIcon],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.scss'],
})
export class FlashcardsComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  flashcard!: FlashcardModel;
  cards: CardModel[] = [];
  profile!: Profile;
  page = 0;

  constructor(
    private store: Store<{
      auth: AuthState;
      flashcard: FlashcardState;
      profile: ProfileState;
    }>,
    private activeRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const flashcardId = this.activeRoute.snapshot.params['id'];
    console.log(flashcardId);
    this.subscription.push(
      this.store.select('auth', 'idToken').subscribe((idToken) => {
        if (idToken) {
          this.store.dispatch(
            FlashcardActions.getFlashcard({
              idToken: idToken,
              flashcardId: flashcardId,
            }),
          );
        }
      }),
      this.store.select('flashcard', 'flashcard').subscribe((flashcard) => {
        this.flashcard = flashcard as FlashcardModel;
        this.cards = flashcard.cards as CardModel[];
        console.log(this.cards.length);
        this.profile = flashcard.authorId as Profile;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    console.log(`Page changed to: ${this.page}`);
  }
}
