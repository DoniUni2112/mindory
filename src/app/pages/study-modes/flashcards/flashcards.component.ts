import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { FlashcardModel } from '../../../models/flashcard.model';
import { CardModel } from '../../../models/card.model';
import { Profile } from '../../../models/profile.model';
import { Store } from '@ngrx/store';
import { AuthState } from '../../../ngrx/auth/auth.state';
import { FlashcardState } from '../../../ngrx/flashcard/flashcard.state';
import { ActivatedRoute } from '@angular/router';
import * as FlashcardActions from '../../../ngrx/flashcard/flashcard.actions';
import { ProfileState } from '../../../ngrx/profile/profile.state';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.scss'],
})
export class FlashcardsComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscription: Subscription[] = [];
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
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const flashcardId = this.route.snapshot.params['id'];
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
        this.cards = flashcard.cards;
        console.log(this.cards.length);
        this.profile = flashcard.authorId as Profile;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  ngAfterViewInit() {
    const cards = document.querySelectorAll('.card') as NodeListOf<HTMLElement>;

    cards.forEach((cardElement) => {
      cardElement.addEventListener('click', () => {
        cardElement.classList.toggle('clicked');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        cards.forEach((cardElement) => {
          cardElement.classList.toggle('clicked');
        });
      }
    });
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.onPageChange(this.page);
    }
  }

  nextPage() {
    if (this.page < this.cards.length - 1) {
      this.page++;
      this.onPageChange(this.page);
    }
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    console.log(`Page changed to: ${this.page}`);
  }
}
