function getTemp( name ) {

	return document.querySelector( `template#${ name }` );

}

function httpReq( method, url, data, cb ) {

	axios( {
		method: method,
		url: url,
		baseURL: 'http://shit.froncubator.com',
		data: data,
		withCredentials: true
	} )
	.then( function ( response ) {

		if ( response.data.errors || response.data.error ) {

			globalService.methods.initMessage( response.data.error || response.data.errors[ 0 ].msg );

		} else if ( cb != undefined ) {

			cb.call( globalService, response );

		}

	} )
	.catch( function ( error ) {

		console.log( error );
		globalService.methods.initMessage( 'Ошибка разработчика' );

	} );

}

// templates
const menuComponent = {
	template: getTemp( 'menu-component' ),
	data: function () {

		return {
			globalService,
		};

	}
}

const navComponent = {
	template: getTemp( 'nav-component' ),
	data: function () {

		return {
			globalService,
			links: [
				{
					name: 'main',
					text: 'Вход',
					path: '/',
				},
				{
					name: 'reg',
					text: 'Регистрация',
					path: '/reg',
				},
				{
					name: 'posts',
					text: 'Посты',
					path: '/posts',
				},
			]
		};

	}
}

const messageComponent = {
	template: getTemp( 'message-component' ),
	data: function () {

		return {
			globalService
		};

	}
}

const main = {
	template: getTemp( 'auth-page' ),
	data: function () {

		return {
			globalService,
			email: '',
			password: '',
			nickname: '',
			picture: '',
			text: 'Вход'
		};

	},
	methods: {
		changeNickName: function ( newNickName ) {

			httpReq( 'put', '/v2/user', { nickname: newNickName }, () => {

				globalService.user.nickName = newNickName;

			} );

		},
		loadFile: function () {


			this.picture = this.$refs.file.files[ 0 ];

		},
		changeAvatar: function () {

			let formData = new FormData();

			formData.append( 'file', this.picture );

			let data = {
				avatar: formData
			};

			httpReq( 'post', '/v2/user/upload/avaуtar', data );

		},
		logOut: function () {

			httpReq( 'get', '/v2/user/logout', null, function ( response ) {

				globalService.methods.initMessage( response.data.message );
				globalService.user.authorized = false;
				globalService.user.nickName = 'Гость';
				globalService.user.userId = null;

			} );

		},
	}
}

const reg = {
	template: getTemp( 'reg-page' ),
	data: function () {

		return {
			globalService,
			message: 'Contacts',
			email: '',
			password: '',
			confirmPassword: '',
			text: 'Страница регистрации'
		};

	}
}

const posts = {
	template: getTemp( 'posts-page' ),
	data: function () {

		return {
			globalService,
			text: 'Список постов',
			postArr: [],
			postTitle: '',
			postMessage: ''
		};

	},
	created: function () {

		this.getPosts();

	},
	methods: {
		getPosts: function () {

			httpReq('get', '/v2/post/user/'+globalService.user.userId, null, response => {

				this.postArr = response.data;

			});

		},
		createPost: function ( title, text ) {

			let data = {
				title: title,
				description: text
			};

			httpReq( 'post', '/v2/post', data, response => {

				this.postMessage = '';
				this.postTitle = '';
				this.getPosts();

			});

		}
	}
}

const article = {
	template: getTemp( 'article-page' ),
	data: function () {

		return {
			globalService,
			article: {},
			text: 'Страница поста',
			comments: false,
			commentMessage: ''
		};

	},
	created: function () {

		if ( !this.globalService.user.authorized ) {

			this.$router.push( { path: '/' } );

		} else if ( this.globalService.user.authorized ) {

			this.getPost();

		}

	},
	methods: {
		getPost: function () {

			httpReq('get', '/v2/post/user/' + globalService.user.userId, null, response => {

				for ( const item of response.data ) {

					if ( item._id === this.$route.params.id ) {

						this.article = item;
						this.comments = ( this.article.comments.length > 0 ) ? true : false;
						break;

					}

				}

			});

			httpReq('get', '/v2/post/5b47942982d24e000c1d6904', null, response => {

				// for ( const item of response.data ) {

				// 	if ( item._id === this.$route.params.id ) {

				// 		this.article = item;
				// 		this.comments = ( this.article.comments.length > 0 ) ? true : false;
				// 		break;

				// 	}

				// }

				console.log(response);

			});

		},
		deletePost: function ( id ) {

			httpReq( 'delete', '/v2/post', { id: id },  response => {

				globalService.methods.initMessage( response.data.message );
				this.$router.push( { path: '/posts' } );

			});

		},
		addComment: function ( message ) {

			let data = {
				message,
				post_id: this.article._id
			};

			httpReq( 'post', '/v2/comment', data, response => {

				this.getPost();
				this.commentMessage = '';

			} );

		},
		deleteComment: function ( id ) {

			httpReq( 'delete', '/v2/comment', { id: id }, () => {

				this.getPost();

			} );

		}
	}
}

let globalService = {
	user: {
		authorized: false,
		nickName: 'Гость',
		userId: null
	},
	message: {
		message: '',
		active: false
	},
	currPage: {
		name: '',
		text: ''
	},
	interval: null,
	methods: {
		logIn: function ( mail, password ) {

			let data = {
				email: mail,
				password: password
			};

			httpReq( 'post', '/v2/user/login', data, function ( response ) {

				globalService.methods.initMessage( 'Вход прошел успешно' );
				globalService.user.authorized = true;
				globalService.user.userId = response.data._id;
				globalService.user.nickName = ( response.data.nickname !== "" ) ? response.data.nickname : globalService.user.nickName;

			} )

		},
		signUp: function ( mail, password, confirmPassword ) {

			let data = {
				email: mail,
				password: password,
				confirmPassword: confirmPassword
			};

			httpReq( 'post', '/v2/user/reg', data, function ( response ) {

				globalService.methods.initMessage( 'Регистрация прошла успешно' );

			} );

		},
		initMessage: function ( message ) {

			globalService.message.message = message;
			globalService.message.active = true;

			return new Promise( ( resolve, reject ) => {

				clearTimeout( globalService.interval );
				globalService.interval = setTimeout(() => {

					globalService.message.active = false;
					resolve();

				}, 2500 );

			}).then( resolve => {

				clearTimeout( globalService.interval );
				globalService.interval = setTimeout( () => {

					globalService.message.message = '';

				}, 300 );

			});
		}
	}
}

Vue.options.delimiters = [ '[[', ']]' ];

Vue.component( 'menu-component', menuComponent );
Vue.component( 'nav-component', navComponent );
Vue.component( 'message-component', messageComponent );

const routes = [
	{
		path: '/',
		component: main,
		name: 'main'
	},
	{
		path: '/reg',
		component: reg,
		name: 'reg'
	},
	{
		path: '/posts',
		component: posts,
		name: 'posts'
	},
	{
		path: '/article/:id',
		component: article,
		name: 'article',
		props: true
	}
];
const router = new VueRouter( {
	routes // сокращённая запись для `routes: routes`
} );

let app = new Vue( {
	delimiters: [ '[[', ']]' ],
	data: {
		msg: 'sss'
	},
	router,
	watch: {
		$route: function( to, from ) {

			globalService.currPage.name = to.name
			globalService.currPage.text = to.matched[ "0" ].components.default.data().text

		}
	},
	created: function () {

		globalService.currPage.name = this.$route.name
		globalService.currPage.text = this.$route.matched[ "0" ].components.default.data().text

	}
} ).$mount( '#app' );