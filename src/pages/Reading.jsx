import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { books } from '../data/bookNotes.js'
import styles from './Reading.module.css'

export default function Reading() {
  const { t } = useTranslation()
  const [selectedSlug, setSelectedSlug] = useState(null)
  const selectedBook = books.find((b) => b.slug === selectedSlug) || null

  if (selectedBook) {
    const isFinished = selectedBook.status === 'finished'
    return (
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={() => setSelectedSlug(null)}>
          {t('reading.back')}
        </button>
        <span className={styles.kicker}>{t('reading.kicker')}</span>
        <h1 className={styles.title}>{selectedBook.title}</h1>
        <p className={styles.byline}>{t('reading.by')} {selectedBook.author}</p>
        <span className={isFinished ? styles.statusFinished : styles.statusReading}>
          {isFinished ? t('reading.status_finished') : t('reading.status_reading')}
        </span>
        {selectedBook.sections.length > 0 ? (
          <div className={styles.sections}>
            {selectedBook.sections.map((section) => (
              <div key={section.heading} className={styles.sectionBlock}>
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
                <p className={styles.sectionBody}>{section.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{t('reading.empty_notes')}</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <span className={styles.kicker}>{t('reading.kicker')}</span>
      <h1 className={styles.title}>{t('reading.title')}</h1>
      <p className={styles.hint}>{t('reading.hint')}</p>
      <div className={styles.list}>
        {books.map((book) => {
          const isFinished = book.status === 'finished'
          return (
            <button
              key={book.slug}
              type="button"
              className={styles.card}
              onClick={() => setSelectedSlug(book.slug)}
            >
              <span className={isFinished ? styles.statusFinished : styles.statusReading}>
                {isFinished ? t('reading.status_finished') : t('reading.status_reading')}
              </span>
              <span className={styles.cardTitle}>{book.title}</span>
              <span className={styles.cardAuthor}>{t('reading.by')} {book.author}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
