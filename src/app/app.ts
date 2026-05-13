import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { collectionData, collection, addDoc, Firestore } from '@angular/fire/firestore';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {

  messages: any[] = [];

  newName = '';
  newMessage = '';
  submitStatus: string | null = null;

  private isBrowser: boolean;

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    const ref = collection(this.firestore, 'messages');

    collectionData(ref, { idField: 'id' })
      .subscribe((data) => {
        this.messages = data as any[];
        // ensure UI updates after async data arrives
        try { this.cdr.markForCheck(); } catch (e) { /* ignore */ }
      });
  }

  trackById(index: number, item: any) {
    return item?.id || index;
  }

  addMessage() {

    console.log('addMessage called', { name: this.newName, message: this.newMessage, isBrowser: this.isBrowser });

    if (!this.isBrowser) {
      console.warn('addMessage: not running in browser, skipping Firestore write.');
      this.submitStatus = 'Cannot send message from server environment.';
      return;
    }

    if (!this.newMessage || !this.newMessage.trim()) {
      this.submitStatus = 'Please enter a message before submitting.';
      return;
    }

    // Create a temporary optimistic message so it appears immediately
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      name: this.newName || 'Anonymous',
      text: this.newMessage,
      pending: true
    } as any;

    // Push optimistically and clear inputs immediately
    this.messages = [...this.messages, tempMsg];
    try { this.cdr.markForCheck(); } catch (e) { /* ignore */ }
    const nameToSend = this.newName;
    const messageToSend = this.newMessage;
    this.newName = '';
    this.newMessage = '';
    this.submitStatus = 'Sending...';

    const ref = collection(this.firestore, 'messages');

    addDoc(ref, {
      name: nameToSend || 'Anonymous',
      text: messageToSend,
      created: new Date()
    })
      .then((docRef) => {
        console.log('Message written with id:', docRef.id);
        this.submitStatus = 'Message sent!';
        // replace temporary message with actual one
        this.messages = this.messages.map(m => m.id === tempId ? { id: docRef.id, name: nameToSend || 'Anonymous', text: messageToSend } : m);
        try { this.cdr.markForCheck(); } catch (e) { /* ignore */ }
      })
      .catch(err => {
        console.error('Failed to add message:', err);
        this.submitStatus = 'Failed to send message.';
        // mark the temp message as failed
        this.messages = this.messages.map(m => m.id === tempId ? { ...m, pending: false, failed: true } : m);
        try { this.cdr.markForCheck(); } catch (e) { /* ignore */ }
      });
  }
}