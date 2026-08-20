type PaymentHistoryCardProps = {
  trainerName: string
  trainerImage?: string | null
  trainingName: string
  date: string
  time: string
  price: number
  status: string
}


function getInitials(name: string) {
  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
}


function PaymentHistoryCard({
  trainerName,
  trainerImage,
  trainingName,
  date,
  time,
  price,
  status,
}: PaymentHistoryCardProps) {


  return (
    <article className="payment-card">


      <div className="payment-card__trainer">


        <div className="payment-card__avatar">

          {trainerImage ? (

            <img
              src={trainerImage}
              alt={trainerName}
            />

          ) : (

            <span>
              {getInitials(trainerName)}
            </span>

          )}

        </div>



        <div className="payment-card__info">

          <h3>
            {trainerName}
          </h3>


          <p className="payment-card__training">
            {trainingName}
          </p>


          <div className="payment-card__details">

            <span>
              📅 {date}
            </span>


            <span>
              🕒 {time}
            </span>

          </div>


        </div>


      </div>



      <div className="payment-card__separator" />



      <div className="payment-card__action">


        <strong>
          {price} zł
        </strong>


        <span className="payment-status">
          ✓ {status}
        </span>


      </div>


    </article>
  )
}


export default PaymentHistoryCard