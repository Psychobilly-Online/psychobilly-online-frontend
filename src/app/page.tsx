import Link from "next/link";

export default function Home() {
  return (
    <div id="container" className="container">
      <div id="header" />
      
      <div id="content" className="row">
        <div className="col1 col-lg-8 col-md-8 col-xs-12" id="col1">
          <div className="bigBox" style={{ marginBottom: '20px' }}>
            <div className="bigBoxContent">
              <h1>Psychobilly Online: Farewell and welcome back!</h1>
              After the server got another PHP update, the forum software finally reached its end of life and could not be updated anymore. There was no other choice then switching it off for good.
              <br/><br/>
              While it seemed as this would be the last nail to the coffin of Psychobilly Online, it simply didn&apos;t want to die. A brandnew software has been installed, and all user accounts have been migrated to the new forum. The only downside is that the encrypted passwords could not be transfered to the new forum, so you will need to set up a new password (which requires you to remember your email address you signed up with).
              <br/><br/>
              Over the next weeks and months i will work on migrating the old forums, topics and posts to the new forum. This will most likely take quite some time, as the differences in the data structure are complex, and as we talk about more than 1.5 million posts.
              <br/><br/>
              Anyway, <a href={`${process.env.NEXT_PUBLIC_LEGACY_URL}/community`}>here&apos;s the new board</a>!
            </div>
          </div>
        </div>
        <div className="col2 col-lg-4 col-md-4 col-xs-12" id="col2">
          
        </div>
      </div>
      
      <div id="pageBottom">        
        &copy; Psychobilly Online 2008 / 2026
      </div>
    </div>
  );
}
