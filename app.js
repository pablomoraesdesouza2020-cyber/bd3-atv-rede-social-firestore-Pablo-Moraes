$(function () {
    const socket = io();
    const $modal = $('#myModal');
    const $form = $('#frm_post');
    const $title = $('#txt_titulo');
    const $text = $('#txt_post');
    const $submit = $('#btn_postar');
    const $posts = $('.posts_container');

    function renderPost(post, prepend) {
        const $container = $('<article>').addClass('post_container');
        const $title = $('<h2>').text(post.title);
        const $text = $('<p>').text(post.text);
        const date = new Date(post.createdAt);
        const $date = $('<span>').text(
            Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR')
        );

        $container.append($title, $text, $date);

        if (prepend) {
            $posts.prepend($container);
        } else {
            $posts.append($container);
        }
    }

    $('#btn_post').on('click', function () {
        $modal.show();
        $title.trigger('focus');
    });

    $('.close').on('click', function () {
        $modal.hide();
    });

    $modal.on('click', function (event) {
        if (event.target === this) {
            $modal.hide();
        }
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape') {
            $modal.hide();
        }
    });

    socket.on('previousMessage', function (posts) {
        $posts.empty();
        posts.forEach(function (post) {
            renderPost(post, false);
        });
    });

    socket.on('receivedMessage', function (post) {
        renderPost(post, true);
    });

    socket.on('postSaved', function () {
        $submit.prop('disabled', false);
        $form[0].reset();
        $modal.hide();
    });

    socket.on('serverError', function (message) {
        $submit.prop('disabled', false);
        window.alert(message);
    });

    $form.on('submit', function (event) {
        event.preventDefault();

        const title = $title.val().trim();
        const text = $text.val().trim();
        if (!title || !text) {
            window.alert('Informe um título e um texto válidos.');
            return;
        }

        $submit.prop('disabled', true);
        socket.emit('sendMessage', { title, text });
    });
});
