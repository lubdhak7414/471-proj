import supImg from '../assets/suport 1.png'
import logo from '../assets/construction_14716868.png'
import Login from '../assets/login 1.png'
import offers from '../assets/discount 1.png'
import Faq from '../assets/help 1.png'
import Navbar from '../sections/navbar.jsx'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import { useNavigate } from 'react-router-dom';


const SuccessModal = ({ onClose, paymentMethod }) => {
//    const navigate = useNavigate();
   const handleClose = () => {
    onClose();
    // navigate('/search'); 
  };
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Payment Successful!</h2>
        <p>Your booking was successful.</p>
        <p>Payment method: {paymentMethod}</p>
        <button 
          onClick={handleClose}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};


export default function PaymentGateway(){
    const navigate = useNavigate(); 
    const [activeTab, setActiveTab] = useState('card');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setPaymentMethod(activeTab === 'card' ? 'Credit/Debit Card' : 
                        activeTab === 'mobile' ? 'Mobile Banking' : 'Net Banking');
        setShowSuccessModal(true);
    // Add your payment processing logic here
   };
   const closeModal = () => {
        setShowSuccessModal(false);
        navigate('/search');

    };

    return <>
    <Navbar />
    <div className="payment-container" style={{width:'50%',margin:'auto',border:'1px solid #898888',padding:'1rem',marginTop:'3rem',backgroundColor:'#f1f1e6',color:'#000'}}>
            {showSuccessModal && (
                <SuccessModal onClose={closeModal}  paymentMethod={paymentMethod}  />
            )}
        


            <div className="payment-header" style={{width:'40%',textAlign:'center',margin:'auto',display:'flex',marginBottom:'5rem',marginTop:'2rem'}}>
                <img src={logo} alt="" />
                <h1 style={{width:'100%',fontSize:'2.3rem',fontWeight:'600',textAlign:'center',color:'#000'}}>Repair BD</h1>

            </div>

            <div className="payment-content" style={{display:'flex',justifyContent:'space-evenly',marginBottom:'2rem',marginTop:'2rem'}}>
              <div className="" style={{color:'#000',fontSize:'1.2rem'}}>
                <img src={supImg} alt="" />
                <p>Support</p>
              </div>
              <div className="" style={{color:'#000',fontSize:'1.2rem'}}>
                <img src={Faq} alt="" />
                <p>FAQ</p>
              </div>
              <div className="" style={{color:'#000',fontSize:'1.2rem'}}>
                    <img src={offers} alt="" />
                <p>Offers</p>
              </div>
              <div className="" style={{color:'#000',fontSize:'1.2rem'}}>
                    <img src={Login} alt="" />
                <p>Login</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="tab"style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',marginBottom:'1rem',}}>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                  onClick={() => handleTabChange('card')}
                  style={{width:'100%',padding:'0.6rem',backgroundColor:'#3b68f1ec',border:'none',color:'#fff',fontSize:'1.1rem',cursor:'pointer'}}
                >
                  Cards
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
                  onClick={() => handleTabChange('mobile')}
                  style={{width:'100%',padding:'0.6rem',backgroundColor:'#3b68f1ec',border:'none',color:'#fff',fontSize:'1.1rem',borderLeft:'1px solid #fff',cursor:'pointer'}}
                >
                  Mobile Banking
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
                  onClick={() => handleTabChange('bank')}
                  style={{width:'100%',padding:'0.6rem',backgroundColor:'#3b68f1ec',border:'none',color:'#fff',fontSize:'1.1rem',borderLeft:'1px solid #fff',cursor:'pointer'}}
                >
                  Net Banking
                </button>
              </div>

              {/* Card Payment Tab */}
              {activeTab === 'card' && (
                <div className="tab-content active">
                  <div className="form-group-body">
                    <div className="form-group" style={{display:'grid',gridTemplateColumns:'1fr'}}>
                        <input type="text" placeholder="Card Number" required />
                      </div>
                      <div className="" style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
                        <div className="form-group" >
                          <input type="text" placeholder="MM/YY" required />
                        </div>
                        <div className="form-group">
                          <input type="text" placeholder="CVV" required />
                        </div>

                      </div>

                      <div className="form-group">
                        <input type="text" placeholder="Card Holders Name" required />
                      </div>

                  </div>


                  <div className="">
                    <label class="custom-checkbox-container" style={{color:'#000',margin:'20px'}}>
                        <input type="checkbox" style={{marginRight:'10px'}}class="hidden-checkbox"/>
                        <span class="custom-checkbox-visual"></span>
                        Remember Card
                    </label>
                    <p>By checking this box you agree to the <span>Terms of Services</span></p>
                  </div>


                </div>
              )}

              {/* Mobile Banking Tab */}
              {activeTab === 'mobile' && (
                <div className="tab-content active">
                  <div className="form-group-body">
                  <div className="form-group">
                    <label style={{color:'#000',fontSize:'1.3rem'}}>Select Mobile Bank</label>
                    <select required style={{color:'#000',fontSize:'1.3rem',border:'1px solid #8c8b8b',paddingLeft:'20px',marginLeft:'20px'}}>
                      <option value="">-- Select --</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="upay">Rocket</option>
                      <option value="upay">Upay</option>
                      <option value="upay">Cellfin</option>
                      <option value="upay">UCash</option>
                      <option value="upay">UPai</option>
                      <option value="upay">Pathao</option>
                      <option value="upay">MeghnaPay</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{color:'#000',fontSize:'1.3rem'}}>Mobile Number</label>
                    <input type="tel" placeholder="01XXXXXXXXX" required />
                    <label style={{color:'#000',fontSize:'1.3rem'}}>Pin Number</label>
                    <input type="tel" placeholder="01XXXX" required />
                  </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Tab */}
              {activeTab === 'bank' && (
                <div className="tab-content active">
                  <div className="form-group-body">
                  <div className="form-group">
                    <label style={{color:'#000',fontSize:'1.3rem'}} >Net Banking</label>
                    <select required style={{color:'#000',fontSize:'1.3rem',border:'1px solid #8c8b8b',paddingLeft:'20px',marginLeft:'20px'}}>
                      <option value="">-- Select Bank --</option>
                      <option value="dutch-bangla">Dutch-Bangla Bank</option>
                      <option value="brac">BRAC Bank</option>
                      <option value="brac">Prime Bank</option>
                      <option value="brac">Dhaka Bank</option>
                      <option value="brac">SBAC Bank Bank</option>
                      <option value="city">City Bank</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{color:'#000',fontSize:'1.3rem'}} >Account Number</label>
                    <input type="text" placeholder="Enter account number" required />
                  </div>
                  </div>
                </div>
              )}

              <button type="submit" className="pay-btn">
                Pay Now
              </button>
            </form>
    </div>

    </>
    
 
}