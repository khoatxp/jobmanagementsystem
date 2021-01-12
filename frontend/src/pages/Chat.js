import React,{Fragment,useState, useContext, useEffect} from 'react';
import { AuthContext } from '../context/auth';
import { Col, Form, Row } from 'react-bootstrap'
import Message from '../components/Message';
import {Grid,Button} from 'semantic-ui-react';
import { ListGroup } from 'react-bootstrap';
import '../App.scss'

var roomId;
export default function Chat(props){
    
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [messageRooms, setMessageRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeRoomId, setActiveRoomId] = useState("")
    const [addUser, setAddUser]=useState("")
    const [msg, setMsg] = useState("");
    const [receiver, setReceiver] = useState("");
    
 

     
    useEffect(() => {
        const interval = setInterval(function() {
            if( roomId ){

                console.log("calling endpoint")
                getMessagesFromRoomId(user.username,roomId).then((results)=>{
                    setMessages(results.reverse())
                })
            }
            
          }, 2000);
        getMessageRooms(user.username).then((results)=>{
            setMessageRooms(results);
            setLoading(false);
        })
        setLoading(true);
        return () => {
            console.log("stoping interval");
            clearInterval(interval);
        }
    }, [])
   
    

    
    return(
        <>
        <Fragment>
            <Row className="bg-white">
                <Col xs={2} md={4} className="p-0 bg-secondary">
                {(loading)  ? (
                    <h1>Loading...</h1>
                    ) : (
                    <ListGroup variant="flush">
                        
                        {
                            messageRooms && messageRooms.map( (messageRoom, index) => 
                            <Button
                            key={index} 
                            color={activeRoomId === messageRoom.messageRoomId?"blue":"gray"}
                            onClick = {()=>{
                                roomId=messageRoom.messageRoomId
                                getMessagesFromRoomId(user.username,messageRoom.messageRoomId).then((results)=>{
                                    setMessages(results.reverse())
                                })
                                setActiveRoomId(messageRoom.messageRoomId)
                                setReceiver(messageRoom.name)
                              
                                }
                            }
                            >
                            <Grid.Column >
                                <Grid.Row>
                                {messageRoom.name}
                                </Grid.Row>
                                <Grid.Row className="right">
                                 {messageRoom.recent_message_datetime}
                                </Grid.Row>
                            </Grid.Column>
                            </Button>
                            )
                            
                        }
                    </ListGroup>)}
                </Col>
                <Col xs={10} md={8}>
                    <div className="messages-box d-flex flex-column-reverse">
                        {messages && messages.map((message, index)=>(
                             <Fragment key={index}>
                                <Message message={message} index={index}/>
                                {messages.length && index === messages.length - 1 && (
                                <div className="invisible">
                                    <hr className="m-0" />
                                </div>
                                )}
                             </Fragment>
                            ))}
                    </div>
                    <div>
                    <Form >
                        <Form.Group className="d-flex align-items-center">
                            <Form.Control
                            type="text"
                            className="message-input rounded-pill p-4 bg-secondary border-0"
                            placeholder="Type a message..."
                            value={msg}
                            onChange={(event)=>setMsg(event.target.value)}
                            
                            />
                            <Button
                         
                            className="fas fa-paper-plane fa-2x text-primary ml-2"
                            onClick={(e)=>{
                                e.preventDefault();
                                sendMessage(user.username, receiver, msg, activeRoomId).then(
                                    (results)=>{
                                        if(results){
                                            getMessagesFromRoomId(user.username,activeRoomId).then((res)=>{
                                                setMessages(res.reverse())
                                            })
                                        }})
                                setMsg("");
                                }}
                            role="button"
                            >Send
                            </Button>
                        </Form.Group>
                    </Form>
                    </div>
                </Col>
            </Row>
            <Row className="bg-white">
               
            </Row>
        </Fragment>
        <Fragment>
            <div className ="page-title">
                Start a conversation                
            </div>
            <Form >
                <Form.Group className="d-flex align-items-center">
                    <Form.Control
                    type="text"
                    className="message-input rounded-pill p-4 bg-secondary border-0"
                    placeholder="Enter username to start talking..."
                    value={addUser}
                    onChange={(event)=>setAddUser(event.target.value)}
                    
                    />
                    <Button
                    
                    className="fas fa-paper-plane fa-2x text-primary ml-2"
                    onClick={(e)=>{
                        e.preventDefault();
                        createMessageRoom(user.username,addUser).then((results)=>{
                            
 
                            if(Object.keys(results).length){
                               window.location.reload();

                            }
                            else{
                                window.alert("Cannot create room")
                            }
                        })
                        }}
                    role="button"
                    >Submit
                    </Button>
                </Form.Group>
            </Form>
        </Fragment>
      
                        </>
    )
}


function getMessageRooms (username) {
    return fetch(
      ` https://messagingservice-pvwu2w75ta-uw.a.run.app/messaging/messageRoom?username=${username}`,
      {
        method: 'GET'
      }
    )
      .then(res => res.json())
      .then(res => res)
      .catch(error => {
        console.error(error);
        return [];
      });
  }

function getMessagesFromRoomId (username, roomId){
    return fetch(
        ` https://messagingservice-pvwu2w75ta-uw.a.run.app/messaging/message/update/${username}/${roomId}`,
        {
          method: 'GET'
        }
      )
        .then(res => res.json())
        .then(res => res.messages)
        .catch(error => {
          console.error(error);
          return [];
        });
}

function sendMessage (sender, recipient, message, messageRoomId){

    const requestOptions = {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({sender: sender, recipient: recipient, message: message, messageRoomId: messageRoomId})
    };
    
    return fetch('https://messagingservice-pvwu2w75ta-uw.a.run.app/messaging/sendMessage', requestOptions)
    .then(
        res=>res.json()
    )
    .then(res => res)
}

function createMessageRoom(sender, recipient){
    const requestOptions = {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({sender: sender, recipient: recipient})
    };
    return fetch('https://messagingservice-pvwu2w75ta-uw.a.run.app/messaging/messageRoom/create', requestOptions)
    .then(
        res=>res.json()
    ).then(res=>res)

}