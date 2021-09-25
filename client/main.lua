local currentlyInGame = false
local passed = false
local gui = false

function startGame()
    openGui()
    currentlyInGame = true
    while currentlyInGame do
        Wait(500)
    end
    return passed;
end

RegisterNetEvent('hacking-minigame:death')
AddEventHandler('hacking-minigame:death', function()
    SendNUIMessage({type = "death"})
end)

RegisterNUICallback('success', function(data, cb)
    passed = true
    currentlyInGame = false
    closeGui()
    cb('ok')
end)

RegisterNUICallback('failure', function(data, cb)
    passed = false
    currentlyInGame = false
    closeGui()
    cb('ok')
end)

function openGui()
    gui = true
    SetNuiFocus(true,true)
    SendNUIMessage({type = "enableui"})
end

function closeGui()
    gui = false
    SetNuiFocus(false,false)
    SendNUIMessage({type = "closeui"})
end