import { useState } from 'react'
import { Link } from 'react-router-dom'

import '../../pages/ProfileSectionPage.css'
import PaymentCard from './PaymentCard'
import PaymentHistoryCard from './PaymentHistoryCard'
import PaymentMethodCard from './PaymentMethodCard'


type PaymentTab =
  | 'pending'
  | 'history'
  | 'methods'


function PaymentsSection() {
  const [activeTab, setActiveTab] =
    useState<PaymentTab>('pending')


  return (
    <main className="profile-section-page">
      <div className="profile-section-page__container">

        <Link
          to="/profile"
          className="profile-section-page__back"
        >
          ← Profil
        </Link>


        <header className="profile-section-page__header">

          <p className="profile-section-page__eyebrow">
            PROFIL
          </p>

          <h1>
            Płatności
          </h1>

          <p className="profile-section-page__description">
            Tutaj znajdziesz historię płatności i szczegóły transakcji.
          </p>

        </header>


        <div className="payments-tabs">

          <button
            className={
              activeTab === 'pending'
                ? 'payments-tabs__button payments-tabs__button--active'
                : 'payments-tabs__button'
            }
            onClick={() =>
              setActiveTab('pending')
            }
          >
            Oczekujące
          </button>


          <button
            className={
              activeTab === 'history'
                ? 'payments-tabs__button payments-tabs__button--active'
                : 'payments-tabs__button'
            }
            onClick={() =>
              setActiveTab('history')
            }
          >
            Historia
          </button>


          <button
            className={
              activeTab === 'methods'
                ? 'payments-tabs__button payments-tabs__button--active'
                : 'payments-tabs__button'
            }
            onClick={() =>
              setActiveTab('methods')
            }
          >
            Metody płatności
          </button>

        </div>



        <section className="payments-content">


            {activeTab === 'pending' && (

            <div className="payments-list">

                <PaymentCard
                trainerName="Adam Nowak"
                trainerImage="/avatar.jpg"
                trainingName="Trening personalny"
                date="18 sierpnia 2026"
                time="18:00"
                price={150}
                />

            </div>

            )}



            {activeTab === 'history' && (

            <div className="payments-list">


            <PaymentHistoryCard

            trainerName="Adam Nowak"

            trainerImage="/avatar.jpg"

            trainingName="Trening personalny"

            date="14 sierpnia 2026"

            time="18:00"

            price={150}

            status="Opłacono"

            />


            </div>

            )}



            {activeTab === 'methods' && (

            <div className="payments-methods">


            <h2>
                Twoje metody płatności
            </h2>


            <PaymentMethodCard
                icon="💳"
                title="Karta płatnicza"
                description="Dodaj kartę, aby szybciej opłacać treningi."
            />


            <PaymentMethodCard
                icon=""
                title="Apple Pay"
                description="Płać jednym kliknięciem na urządzeniach Apple."
            />


            <PaymentMethodCard
                icon="G"
                title="Google Pay"
                description="Szybkie płatności przez konto Google."
            />



            <h2 className="payment-methods-trainer-title">
                Płatność u trenera
            </h2>


            <PaymentMethodCard
                icon="💵"
                title="Gotówka / terminal"
                description="Zapłać bezpośrednio podczas wizyty u trenera."
                active
            />


            </div>

            )}


        </section>


      </div>
    </main>
  )
}


export default PaymentsSection