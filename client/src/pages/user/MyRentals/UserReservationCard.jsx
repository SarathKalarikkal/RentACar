import React, { useState } from 'react';
import { formatDate } from '../../../math/formatDate';
import ReservationForm from '../../../components/ReservationForm/ReservationForm';
import axiosInstance from '../../../config/axiosInstance';
import toast, { Toaster } from 'react-hot-toast';
import ReservationUpdateForm from '../../../components/user/ReservationUpdateForm';
import { loadStripe } from "@stripe/stripe-js";



const UserReservationCard = ({ reservation, onDelete , fetchReservation, setConfirmDelete,confirmDlete }) => {

    const startDate = formatDate(reservation?.startDate);
    const endDate = formatDate(reservation?.endDate);
    const updatedDate = formatDate(reservation?.updatedAt);

   

  
    const [formActive, setFormActive] = useState(false);

    const editHandler = () => {
        setFormActive(true);
    };

    


    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_Publishable_key);

const makePayment = async () => {
    try {
        const stripe = await stripePromise;

        // Create a Checkout Session
        const { data } = await axiosInstance.post('/payment/create-checkout', { reservation });


        
        // Redirect to Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: data.id
        });

        if (result.error) {
            // Show error to your customer (e.g., insufficient funds, card error, etc.)
            toast.error(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred. Please try again.');
    }
};


const handleReturn = async () => {
  try {
      const response = await axiosInstance.put(`/reservation/return/${reservation._id}`);
      
      if (response.data.success) {
          toast.success("Car returned successfully!");
          fetchReservation()
      } else {
          toast.error(response.data.message || "Failed to return the car.");
      }
  } catch (error) {
      console.error('Error returning the car:', error);
      toast.error('An error occurred while returning the car. Please try again.');
  }
};
  



    return (
      <>
        <div className="col-md-6">
          <Toaster />
          <div className="rent-card-long mb-3 row">
            <div className="col-12 col-md-12 col-lg-4 p-0">
              <img
                className="rental-img-car "
                src={reservation?.car?.image}
                alt=""
              />
            </div>
            <div className="col-12 col-md-12 col-lg-8">
              <div className="rental-card-right">
                <div className="rental-status">
                  <p>Status :</p>
                  <span
                    className={`${
                      reservation?.status === "pending"
                        ? "pending"
                        : "confirmed"
                    }`}
                  >
                    {reservation?.status}
                  </span>
                </div>
                <h3>
                  {reservation?.car?.make} {reservation?.car?.model}
                </h3>
                <div className="rented-box">
                  <label>Rental Period :</label>
                  <span>
                    {startDate} - {endDate}
                  </span>
                </div>
                <div className="rented-box">
                  <label>Total Price :</label>
                  <span>{reservation?.totalRate} Rs</span>
                </div>
                <div className="rented-box-below">
                  <div className="rental-btn">
                    <button
                      className={`${
                        reservation?.status === "confirmed" || reservation?.status === "payed"
                          ? "d-none"
                          : "edit-reservation"
                      }`}
                      onClick={editHandler}
                    >
                      Edit
                    </button>
                    <button
                      className={`${
                        reservation?.status === "confirmed" || reservation?.status === "payed"
                          ? "d-none"
                          : "cancel-reservation"
                      }`}
                      onClick={()=>setConfirmDelete(true)}
                    >
                      Cancel
                    </button>
                    <button
                      className={`${
                        reservation?.status === "confirmed"
                          ? "pay-reservation"
                          : "d-none"
                      }`}
                      onClick={makePayment}
                    >
                      Pay
                    </button>
                    <button
                      className={`${
                        reservation?.status === "payed" ? "return" : "d-none"
                      }`}
                      onClick={handleReturn}
                    >
                      Return
                    </button>
                  </div>
                  <p className="updated-status">
                    Last updated on {updatedDate}
                  </p>
                </div>
                {formActive && (
                  <ReservationUpdateForm
                    setFormActive={setFormActive}
                    reservation={reservation}
                    carDetail={{
                      name: `${reservation?.car?.make || "Car Make"} ${
                        reservation?.car?.model
                      }`,
                      rentPerHour: reservation?.rentPerHour,
                      id: reservation?.car._id,
                    }}
                    initialData={{
                      startDate: reservation?.startDate,
                      endDate: reservation?.endDate,
                      rentPerHour: reservation?.rentPerHour,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {
          confirmDlete && 
          <>
           <div className='confirmDelete'>
               <div className="cfm-card">
                  <p>Are Sure? You want to Cancel the reservation?</p>
                  <div>
                  <button className='yes-btn me-3' onClick={onDelete}>Yes</button>
                  <button className='no-btn' onClick={()=>setConfirmDelete(false)}>No</button>
                  </div>
               </div>
           </div>
          </>
        }
      </>
    );
};

export default UserReservationCard;
