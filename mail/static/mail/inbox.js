document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //document.querySelector('.alert alert-danger').style.display='none';

  // By default, load the inbox
  load_mailbox('inbox');
  //when the form is submitted 
  document.querySelector('#compose-form').addEventListener('submit',event=>{
    event.preventDefault();//prevent defatult prevents the form from submitting and reloading the page.
    //sending a post request to the api and storing the information
    if (document.querySelector('#compose-recipients').value==='')
    {
      alert('Atleast one recipient required to send an email.Use ,  to add than one recipient');
      //document.querySelector('#compose-body')
    }
    else
    {

      
    try{
    fetch('/emails',{
      method:'POST',
      body:JSON.stringify({
        recipients:document.querySelector('#compose-recipients').value,
        subject:document.querySelector('#compose-subject').value,
        body:document.querySelector('#compose-body').value
      })
    })
    .then(response=>response.json())
    //once the mail is stored sent mailbox is called with a delay of one second to makesure that the content are loaded.
    .then(()=>{
      setTimeout(()=>load_mailbox('sent'),1000);
      alert('mail sent successfully');
    })
    }
    catch(err){alert('error');}
    }

   });
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-view').style.display='none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function load_mailbox(mailbox) 
{
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display='none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  //send request to the respected mailbox
  fetch(`/emails/${mailbox}`)
  .then(response=>response.json())
  .then(emails=>{
    //for each email present in the mailbox call the list_emails function
    emails.forEach(email=>{list_emails(email,mailbox);});
  }).catch(error=>{console.log(error);});
}
function list_emails(email,mailbox)
{
  //creating a new html tag (i.e) Mailbox_item
  const mailbox_item=document.createElement('div');
  //the classname of the email is changed in accordance to whether
  //the mail is read previously or not.
  
    if (email.read===false)
    {
    mailbox_item.className='mailbox_item_unread';
    //mailbox_item.color='blue';
    }
    else
    {
    mailbox_item.className='mailbox_item_read';
   // mailbox_item.color='red';
    }
  
  
  //information to be in the mailbox_item
  if (mailbox =='sent')
  mailbox_item.innerHTML=`<strong>To:\u00A0\u00A0${email.recipients}</strong>\u00A0\u00A0\u00A0\u00A0 ${email.subject} \u00A0\u00A0\u00A0\u00A0<span style="float:right;">${email.timestamp}</span>`;
  //the content in the mailbox_item changes based on the type of mailbox.
  else
   mailbox_item.innerHTML=`<strong>From:\u00A0\u00A0${email.sender}</strong>\u00A0\u00A0\u00A0\u00A0 ${email.subject} \u00A0\u00A0\u00A0\u00A0<span style="float:right;">${email.timestamp}</span>`;
  //add mailbox item to the DOM
  document.querySelector('#emails-view').append(mailbox_item);
  //an addevent listener is used so that when user clicks an email
  //the display_email fucntion is called and displays the infor of that mail.
  mailbox_item.addEventListener('click',()=> {
    //console.log('inside mailbox_item click');
    fetch(`emails/${email.id}`)
    .then(response=>response.json())
    .then(email=>{setTimeout(()=>display_email(email,mailbox),1000);}).catch(error=>{console.log(error);});
  });
 
  
}
function display_email(email,mailbox)
{
  //make the display-view to appear and others disappear
  document.querySelector('#compose-view').style.display='none';
  document.querySelector('#emails-view').style.display='none';
  document.querySelector('#display-view').style.display='block';

  //when archive button is clicked archive function is called
  document.querySelector('#button-archive').onclick=()=>archive(email);
  //when unarchive button is clicked unarchive button called.
  document.querySelector('#button-unarchive').onclick=()=>unarchive(email);
  //reply function is called with email as argument when reply button is clicked.
  document.querySelector('#button-reply').onclick=()=>reply(email);
  //the visibility of the buttons {archive,unarchive} are changed based on mailbox.
  if (mailbox=='inbox')
  {
    document.querySelector('#button-archive').style.display='inline-block';
    document.querySelector('#button-unarchive').style.display='none';
  }
  else if (mailbox=='sent')
  {
    document.querySelector('#button-archive').style.display='none';
    document.querySelector('#button-unarchive').style.display='none';
  }
  else
  {
    document.querySelector('#button-archive').style.display='none';
    document.querySelector('#button-unarchive').style.display='block';
  }
  //setting the values of the <p></p> tag inside display-view to corresponding email.
  document.querySelector('#from-view').innerHTML=`<strong>From:\u00A0</strong>${email.sender}`;
  document.querySelector('#to-view').innerHTML=`<strong>To:\u00A0</strong>${email.recipients}`;
  document.querySelector('#subject-view').innerHTML=`<strong>Subject:\u00A0</strong>${email.subject}`;
  document.querySelector('#time-view').innerHTML=`<strong>Timestamp:</strong>\u00A0${email.timestamp}`;
  document.querySelector('#body-view').innerHTML=`<strong>${email.body}</strong>`;
  //since the email is displayed it is marked as read 
  fetch(`/emails/${email.id}`,{
    method:'PUT',
    body:JSON.stringify({
      read:true
    })
  }).catch(error=>console.log(error))
}
//function archives the mail and puts it in the archive box in the page
function archive(email) {
  
  if (email.archived === false)
  {
    fetch(`/emails/${email.id}`,{
      method:'PUT',
      body:JSON.stringify({
        archived:true
      })
    }).catch(error=>console.log(result))
    setTimeout(()=>load_mailbox('inbox'),1000);
  }
}
//unarchives the mail in the archived section and puts in the inbox section
function unarchive(email) {
  
  if (email.archived === true)
  {
    fetch(`/emails/${email.id}`,{
      method:'PUT',
      body:JSON.stringify({
        archived:false
      })
    })
    setTimeout(()=>load_mailbox('archive'),1000);
  }
}

function reply(email)
{
  //creating a variable subject and storing the value inside that input tag whose id="compose-view"
  subject=document.querySelector('#compose-subject').value;
  //making the corresponding view to be visible.
  document.querySelector('#emails-view').style.display='none';
  document.querySelector('#compose-view').style.display='block';
  document.querySelector('#display-view').style.display='none';
  document.querySelector('#compose-recipients').value=email.sender;
  // the text of the subject is changed as per the document provided in sepcification
  if (subject.startsWith('Re:'))
  {
    document.querySelector('#compose-subject').value=email.subject;
  }
  else
    document.querySelector('#compose-subject').value=`Re:${email.subject}`;
  //settting the value of the body .
  document.querySelector('#compose-body').innerHTML=`\n\n-------------------------------------------------------------\nOn ${email.timestamp} \t ${email.sender} \tsent :\n ${email.body}`;
}

