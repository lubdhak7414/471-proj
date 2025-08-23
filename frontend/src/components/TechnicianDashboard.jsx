import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatBox from '../components/Chatbox.jsx';
import Navbar from '../sections/navbar.jsx'

import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import welcome from '../assets/11669640_20943849-Photoroom.png'
import {useAuth} from '../context/AuthContext.jsx'


const TechnicianDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({
        pending: 0,
        accepted: 0,
        "in-progress": 0,
        completed: 0
  });

  const {user} = useAuth();


  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const [currentChat, setCurrentChat] = useState( {showList: true});
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [date, setDate] = useState(new Date());


  // const technicianUser = {
  //   _id: '689dbc1e7f68c9bd1ffb7cdd', //this is the user.id of the technicianid since in chatbox user.id is used//John Doe
  // }
  

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/messages/${user._id}/conversations`);
        setConversations(res.data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    };
    
    fetchConversations();
  }, [technicianUser._id]);



  useEffect(() => {
    
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/techDashboard/user/${user._id}/bookings?status=${filter}`

        );
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filter]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const { data } = await axios.patch(
        `http://localhost:3000/api/techDashboard/bookings/${bookingId}`,
        { status: newStatus, userId: user._id }
      );
      
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? data : booking
      ));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <Navbar />
    <div className="dashboard" style={{ width: '95%', borderCollapse: 'collapse', margin:'auto'}}>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
{/*         
        <button onClick={() => setCurrentChat({ showList: true })}>
          <img src={Chat} alt="" />
          <h2>Messages</h2>
        </button> */}
      </div>
      <div className="chat-calender">
        <div className="calender-filter">
            
            <div className="calender-welcome" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginRight:'1rem'}}>
                <div className="welcome" style={{backgroundColor:'#113a8d',display:'grid',gridTemplateColumns:'200px 300px',borderRadius:'0.6rem',height:'290px',margin:'auto'}}>   
                    <div className="" style={{textAlign:'center',margin:'auto'}}>
                          <h1 style={{fontSize:'2rem',marginBottom:'1rem'}}>Hello!</h1>
                          <p style={{fontSize:'1rem'}}>Check client chats and booking details here.</p>
                    </div>
                  
                    <img src={welcome} style={{width:'300px'}}alt="" />
                </div>
                <div className="calender">  <Calendar onChange={setDate} value={date} /></div>
              
            </div>
            <div className="filters">
                <button 
                className={`${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}>
                    <span className="filter-label">Pending Request</span>
                    <span className="filter-count">{bookingCounts.pending}</span></button>
                <button 
                className={`${filter === "accepted" ? "active" : ""}`}
                onClick={() => setFilter("accepted")}>
                    <span className="filter-label">Accepted Jobs </span>
                    <span className="filter-count">{bookingCounts.accepted}</span></button>
                <button 
                className={`${filter === "in-progress" ? "active" : ""}`}
                onClick={() => setFilter("in-progress")}>
                    <span className="filter-label">  In Progress </span>
                    <span className="filter-count">{bookingCounts["in-progress"]}</span></button>
                <button 
                className={`${filter === "completed" ? "active" : ""}`}
                onClick={() => setFilter("completed")}>
                    <span className="filter-label"> Completed  </span>
                    <span className="filter-count">{bookingCounts.completed}</span></button>
            </div>
        </div>
        
        {currentChat && (
        <div className="chat-container">
          {currentChat.showList ? (
            <div className="conversation-list">
              <div className="flex" style={{display:'flex',justifyContent:'space-between'}}> 
                    <h3>Messages</h3>
                    {/* <button onClick={() => setCurrentChat(null)}>
                      <img src={Cross} alt="" />
                    </button> */}

              </div>

              
              {loadingConversations ? (
                <p>Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p>No conversations yet</p>
              ) : (
                conversations.map(convo => {
                  const otherUser = convo.lastMessage.sender._id === technicianUser._id 
                    ? convo.lastMessage.receiver 
                    : convo.lastMessage.sender;
                   const initials = otherUser.name.split(' ')
                      .map(part => part[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);
                    
                    // Generate consistent color based on name
                  const colorIndex = (otherUser.name.charCodeAt(0) % 5 + 1);
                  
                  return (
                    <div 
                      key={convo.lastMessage._id} 
                      className="conversation-item"
                      onClick={() => setCurrentChat({
                        user: otherUser,
                        showList: false
                      })}
                    >
                      <div className={`conversation-avatar color-${colorIndex}`}>
                        {initials}
                      </div>
                      <div>
                        <h4>{otherUser.name}</h4>
                        <p>{convo.lastMessage.content}</p>
                      </div>
                      {convo.unreadCount > 0 && (
                        <span className="unread-count">{convo.unreadCount}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <ChatBox 
              currentUser={user} 
              otherUser={currentChat.user}
              
              onClose={() => setCurrentChat({ showList: true })}
            />
          )}
        </div>
        )}

      </div>

{/* 
      <h4>{bookings.length} Bookings found</h4> */}


      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin:'auto'}}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'#000'}}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'#000'}}>Address</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'#000' }}>Phone</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'#000'}}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'#000' }}>Service</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'#000'}}>Issue</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'#000'}}>Urgency</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' ,color:'#000'}}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd',color:'#000' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center',paddingTop:'4rem',fontSize:'1.3rem'}}>
                  No {filter} bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id} style={{ borderBottom: '1px solid #b5b4b4'}}>

                <td style={{ padding: '12px',color:'#000'}}>{booking.user.name}</td>
                <td style={{ padding: '12px',color:'#000' }}>{booking.address.street}, {booking.address.area}</td>
                <td style={{ padding: '12px',color:'#000' }}>{booking.user.phone}</td>
                <td style={{ padding: '12px' ,color:'#000'}}>{new Date(booking.preferredDate).toLocaleDateString()},{" "}
                {booking.preferredTime}</td>

                <td style={{ padding: '12px' ,color:'#000'}}>{booking.service.name}</td>
                <td style={{ padding: '12px' ,color:'#000'}}>{booking.description}</td>
                <td style={{ padding: '12px' ,color:'#000'}}>{booking.urgency}</td>
                <td style={{ padding: '12px' ,color:'#000'}}>{booking.status}</td>
                <td style={{ 
                  padding: '12px', 
                  color: booking.status === 'approved' ? 'green' : 
                        booking.status === 'rejected' ? 'red' : 'gray'
                }}>
                  {booking.status === "pending" && (
                    <div className="actions">
                      <button
                        onClick={() => handleStatusUpdate(booking._id, "accepted")}
                        className="accept-btn"
                        style={{backgroundColor:'#36ba28',padding:'4px',
                        marginRight:'10px',
                        fontSize:'1rem'
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, "rejected")}
                        className="reject-btn"
                        style={{backgroundColor:'#f63b3b',padding:'4px',
                        fontSize:'1rem'
 
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === "accepted" && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "in-progress")}
                      className="start-btn"
                    >
                      Start Job
                    </button>
                  )}

                  {booking.status === "in-progress" && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, "completed")}
                      className="complete-btn"
                    >
                      Mark Complete
                    </button>
                  )}

                </td>

                </tr>
                

              ))

            )}

          </tbody>
          </table>
      </div>
    </div>
    </>
  );
};

export default TechnicianDashboard;