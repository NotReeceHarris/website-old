$( document ).ready(function() {

    $('nav').addClass('fixed')

    window.onscroll = function() {

        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / height) * 100;
        const scrollPercentage = parseInt(scrolled)

        if (window.pageYOffset >= 10) {
            $('#page-progress #progress-bar').css('width', `${scrollPercentage+5}%`)
        } else {
            $('#page-progress #progress-bar').css('width', `0%`)
        }
    }

    hljs.highlightAll();

    $('.hljs').each(function() {
        $(this).addClass('relative')
        $(this).append(`<div id="copy-code" class="border-green-400 hidden cursor-pointer absolute text-white top-3 right-4 p-2 rounded-md bg-[#363636]"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></div>`)
    })

    $('code').click('#copy-code', function() {
        var textArea = document.createElement("textarea");
        textArea.value = $(this).parent().text();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(textArea.value);

        const btn = $(this).find('#copy-code')
        btn.addClass('border-green-400 border')
        setTimeout(function() {
            btn.removeClass('border-green-400 border')
        }, 1500);

    })

    $('#content h1, #content h2, #content h3, #content h4, #content h5, #content h6').each(function() {
        var text = $(this).text();
        var id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        $(this).attr("id", id);
      });
    $('#content h1, #content h2, #content h3, #content h4, #content h5, #content h6').click(function() {
        var text = $(this).attr('id');
        console.log($(this))
        window.location.hash = text;
    })
});