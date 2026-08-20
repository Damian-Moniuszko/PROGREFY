type PaymentMethodCardProps = {
  title: string
  description: string
  icon: string
  active?: boolean
}


function PaymentMethodCard({
  title,
  description,
  icon,
  active = false,
}: PaymentMethodCardProps) {


  return (
    <article className="payment-method-card">


      <div className="payment-method-card__icon">
        {icon}
      </div>


      <div className="payment-method-card__content">

        <h3>
          {title}
        </h3>


        <p>
          {description}
        </p>


      </div>



      {active && (

        <span className="payment-method-card__status">
          Aktywna
        </span>

      )}


    </article>
  )
}


export default PaymentMethodCard