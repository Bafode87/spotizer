const ROUTES = {
    ALBUM: 'https://mmi.unilim.fr/~morap01/L250/public/index.php/api/albums',
    ARTIST: 'https://mmi.unilim.fr/~morap01/L250/public/index.php/api/artists',
    SONG: 'https://mmi.unilim.fr/~morap01/L250/public/index.php/api/songs',
    PLAYLIST: 'https://mmi.unilim.fr/~morap01/L250/public/index.php/api/playlists'
}

const URI_BASE = 'https://mmi.unilim.fr/';

const URI_YOUTUBE_THUMBNAIL = 'http://img.youtube.com/vi/'

const DETAIL_PATH = {
    ALBUM: '/albums/',
    ARTIST: '/artists/',
    SONG: '/songs/',
    PLAYLIST: '/playlists/'
}

const state = {
    albumsMostRecent: {
        detailPath: DETAIL_PATH.ALBUM,
        items: []
    },
    artistsToDiscover: {
        detailPath: DETAIL_PATH.ARTIST,
        items: []
    },
    artistDetail: new Map(),
    albumDetail: new Map()

}

const actions = {
    async fetchAlbumsMostRecent() {
        try {
            const response = await fetch(`${ROUTES.ALBUM}?page=1`);
            const albums = await response.json();
            return albums;
        }
        catch (err) {
            console.log(err);
        }

    },
    async fetchArtistsToDiscover() {
        try {
            const response = await fetch(`${ROUTES.ARTIST}?page=1`);
            const artists = await response.json();
            artists.forEach((artist) => {
                artist.image = './src/assets/user.svg';
            })

            return artists;
        }
        catch (err) {
            console.log(err);
        }
    },
    async fetchArtistDetail(id) {
        try {
            const response =  await fetch(`${ROUTES.ARTIST}/${id}`)
            const artist = await response.json();
            artist.image = '/src/assets/user.svg';
            const albums = []
            const songs = []

            for (const album of artist.albums) {
                albums.push(await this.fetchAlbum(`${URI_BASE}${album}`))
            }

            for(let song of artist.songs.slice(0, 3)) {
                songs.push(await this.fetchSong(`${URI_BASE}${song}`))
            }
    
            artist.albums = albums
            artist.songs = songs

            return artist;

        }
        catch (err) {
            console.log(err)
        }
    },
    async fetchAlbumDetail(id) {
        try {
            const response = await fetch(`${ROUTES.ALBUM}/${id}`);
            const album = await response.json();
            const artist = await this.fetchArtistDetail(album.artist.id);

            album.artist.image = '/src/assets/user.svg';
            album.artist.name = artist.name;

            return album;
        }
        catch (err) {
            console.log(err);
        }

    },
    async fetchAlbum(path) {
        try {
            const response = await fetch(path);
            const album = await response.json();
            return album
        }
        catch (err) {
            console.log(err);
        }
    },
    async fetchSong(path) {
        try {
            const response = await fetch(path);
            const song = await response.json()
            song.image = await this.fetchThumbnail(song)
            return song
        }
        catch (err) {
            console.log(err);
        }
    },
    async fetchThumbnail({youtube}) {
        const id = youtube.split('/')[4]
        const response = await fetch(`${URI_YOUTUBE_THUMBNAIL}${id}/0.jpg`)
        const uri_thumbnail =  response.url;
        return uri_thumbnail

    }
}

const store = {
    get albumsMostRecent () {
        return state.albumsMostRecent 
    },
    get artistToDiscover () { 
        return state.artistsToDiscover 
    },
    getArtistDetail({ id }) {
        return state.artistDetail.get(id);
    },
    getAlbumDetail({ id }) {

        return state.albumDetail.get(id)
    },
    async INITIALIZE_HOME() {

        if (state.albumsMostRecent.items.length === 0) {
            await Promise.all([
                actions.fetchAlbumsMostRecent().then((albums) => {
                    state.albumsMostRecent.items = albums;
                }),
                actions.fetchArtistsToDiscover().then((artists) => {
                    state.artistsToDiscover.items = artists;
                })
            ])
        }
    },
    async INITIALIZE_ARTIST_DETAIL({ id }) {
        if (!state.artistDetail.has(id)) {
            state.artistDetail.set(id, await actions.fetchArtistDetail(id)); 
        }
        
    },
    async INITIALIZE_ALBUM_DETAIL({ id }) {
        if (!state.albumDetail.has(id)) {
            state.albumDetail.set(id, await actions.fetchAlbumDetail(id));
        }
        
    }
}

export default store;