game {'gta5'}

fx_version 'cerulean'
author 'Kieran#1111'
description 'Custom hacking minigame'

client_scripts {
    'client/*.lua',
}

files {
    'ui/css/*.css',
    'ui/js/*.js',
    'ui/index.html',
}

ui_page 'ui/index.html'

exports {
	'startGame'
}