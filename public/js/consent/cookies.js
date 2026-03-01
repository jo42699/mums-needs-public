
    // Helper: set cookie
    function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000)); 
      const expires = "expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    // Helper: get cookie
    function getCookie(name) {
      const cname = name + "=";
      const decoded = decodeURIComponent(document.cookie);
      const ca = decoded.split(';');
      for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(cname) === 0) {
          return c.substring(cname.length, c.length);
        }
      }
      return "";
    }

    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    // Show banner only if no decision yet
    if (!getCookie('cookie_consent')) {
      banner.style.display = 'block';
    }

    acceptBtn.addEventListener('click', function () {
      setCookie('cookie_consent', 'accepted', 365);
      banner.style.display = 'none';
      
    });

    rejectBtn.addEventListener('click', function () {
      setCookie('cookie_consent', 'rejected', 365);
      banner.style.display = 'none';
    
    });
 