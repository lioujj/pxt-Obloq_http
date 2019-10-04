/**
 *Obloq implementation method.
 */
//% weight=10 color=#096670 icon="\uf1eb" block="Obloq_http"
//% groups=["04_IFTTT","03_ThingSpeak", "02_Weather", "01_System"]
namespace Obloq_http {

    let wInfo: string[][] = [
        ["weather", "main", "", "s"],
        ["description", "description", "", "s"],
        ["temperature", "\"temp\"", "", "k"],
        ["humidity", "dity", "", "n"],
        ["temp_min", "temp_min", "", "k"],
        ["temp_max", "temp_max", "", "k"],
        ["speed", "speed", "", "n"],
        ["sunrise", "sunrise", "", "n"],
        ["sunset", "sunset", "", "n"],
        ["timezone", "timezone", "", "n"],
        ["cityName", "name", "", "s"]
    ]

    export enum wType {
        //% block="city name"
        cityName = 10,
        //% block="weather"
        weather = 0,
        //% block="description"
        description = 1,
        //% block="temperature"
        temperature = 2,
        //% block="humidity"
        humidity = 3,
        //% block="low temperature"
        temp_min = 4,
        //% block="maximum temperature"
        temp_max = 5,
        //% block="wind speed"
        speed = 6,        
        //% block="time of sunrise"
        sunrise = 7,
        //% block="time of sunset"
        sunset = 8
    }

    //serial
    let OBLOQ_SERIAL_INIT = false
    let OBLOQ_WIFI_CONNECTED = false
    let OBLOQ_SERIAL_TX = SerialPin.P2
    let OBLOQ_SERIAL_RX = SerialPin.P1
    let OBLOQ_WIFI_SSID = ""
    let OBLOQ_WIFI_PASSWORD = ""
    let OBLOQ_IP = ""
    let cityID = ""
    let weatherKey = ""
    let aa = 0

    export enum cityIDs {
        //% block="Taipei"
        Taipei = 1668341,
        //% block="Hong Kong"
        HongKong = 1819729,
        //% block="Tokyo"
        Tokyo = 1850147,
        //% block="Seoul"
        Seoul = 1835848,
        //% block="Beijing"
        Beijing=1816670,
        //% block="Shanghai"
        Shanghai=1796236,      
        //% block="Singapore"
        Singapore=1880252, 
        //% block="London"
        London=2643743, 
        //% block="Berlin"
        Berlin=2950159, 
        //% block="Paris"
        Paris= 2988507,
        //% block="New York"
        NewYork=5128638, 
        //% block="Sydney"
        Sydney=2147714 
    }

    export enum city2IDs {
        //% block="Keelung"
        Keelung = 6724654,
        //% block="Taipei"
        Taipei = 1668341,
        //% block="Xinbei"
        Xinbei = 1670029,
        //% block="Taoyuan"
        Taoyuan = 1667905,
        //% block="Hsinchu"
        Hsinchu = 1675107,
        //% block="Miaoli"
        Miaoli = 1671971,
        //% block="Taichung"
        Taichung = 1668399,
        //% block="Changhua"
        Changhua = 1679136,
        //% block="Nantou"
        Nantou = 1671564,
        //% block="Yunlin"
        Yunlin = 1665194,
        //% block="Jiayi"
        Jiayi = 1678836,
        //% block="Tainan"
        Tainan = 1668352,
        //% block="Kaohsiung"
        Kaohsiung = 7280289,
        //% block="Pingtung"
        Pingtung = 1670479,
        //% block="Yilan"
        Yilan = 1674197,
        //% block="Hualien"
        Hualien = 1674502,
        //% block="Taitung"
        Taitung = 1668295,
        //% block="Penghu"
        Penghu = 1670651,
        //% block="Jincheng"
        Jincheng = 1678008,
        //% block="Nangan"
        Nangan = 7552914
    }

    function obloqWriteString(text: string): void {
        serial.writeString(text)
    }
    
    /*
    function startWork():void{
        basic.clearScreen()
        led.plot(1, 2)
        led.plot(2, 2)
        led.plot(3, 2)
    }
    */

    function Obloq_serial_init(): void {
        obloqWriteString("123")
        let item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        serial.redirect(
            OBLOQ_SERIAL_TX,
            OBLOQ_SERIAL_RX,
            BaudRate.BaudRate9600
        )
        serial.setRxBufferSize(200)
        serial.setTxBufferSize(100)
        obloqWriteString("\r")
        item = serial.readString()
        obloqWriteString("|1|1|\r")
        item = serial.readUntil("\r")
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        item = serial.readString()
        OBLOQ_SERIAL_INIT = true
    }

    function getTimeStr(myTimes: number): string {
        let myTimeStr = ""
        let secs = myTimes % 60
        let mins = Math.trunc(myTimes / 60)
        let hours = Math.trunc(mins / 60)
        mins = mins % 60
        hours = hours % 24
        if (hours < 10)
            myTimeStr = "0" + hours
        else
            myTimeStr = "" + hours
        myTimeStr += ":"
        if (mins < 10)
            myTimeStr = myTimeStr + "0" + mins
        else
            myTimeStr = myTimeStr + mins
        myTimeStr += ":"
        if (secs < 10)
            myTimeStr = myTimeStr + "0" + secs
        else
            myTimeStr = myTimeStr + secs
        return myTimeStr
    }

    function Obloq_connect_wifi(): void {
        if (OBLOQ_SERIAL_INIT) {
            if (!OBLOQ_SERIAL_INIT) {
                Obloq_serial_init()
            }
            let item = "test"
            obloqWriteString("|2|1|" + OBLOQ_WIFI_SSID + "," + OBLOQ_WIFI_PASSWORD + "|\r") //Send wifi account and password instructions
            item = serial.readUntil("\r")
            while (item.indexOf("|2|3|") < 0) {
                item = serial.readUntil("\r")
            }
            OBLOQ_IP = item.substr(5, item.length - 6)
            OBLOQ_WIFI_CONNECTED = true
            basic.showIcon(IconNames.Yes)
        }

    }


    /**
     * Setup Obloq Tx Rx to micro:bit pins and WIFI SSID, password.
     * 設定Obloq的Tx、Rx連接腳位，以及WIFI的名稱及密碼
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param receive to receive ,eg: SerialPin.P1
     * @param send to send ,eg: SerialPin.P2
    */
    //% weight=100 group="01_System"
    //% receive.fieldEditor="gridpicker" receive.fieldOptions.columns=3
    //% send.fieldEditor="gridpicker" send.fieldOptions.columns=3
    //% blockId=Obloq_WIFI_setup blockGap=5
    //% block="Obloq setup WIFI | Pin set: | Receive data (green wire): %receive| Send data (blue wire): %send | Wi-Fi: | Name: %SSID| Password: %PASSWORD| Start connection"
    export function Obloq_WIFI_setup(/*serial*/receive: SerialPin, send: SerialPin,
                                     /*wifi*/SSID: string, PASSWORD: string
    ):
        void {
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        OBLOQ_WIFI_SSID = SSID
        OBLOQ_WIFI_PASSWORD = PASSWORD
        OBLOQ_SERIAL_TX = send
        OBLOQ_SERIAL_RX = receive
        Obloq_serial_init()
        Obloq_connect_wifi()
    }
/*
    //% weight=99
    //% blockId=Obloq_serial_disconnect
    //% block="Obloq serial disconnect"
    export function Obloq_serial_disconnect(): void {
        OBLOQ_SERIAL_INIT = false
    }
    //% weight=98
    //% blockId=Obloq_serial_reconnect
    //% block="Obloq serial reconnect"
    export function Obloq_serial_reconnect(): void {
        Obloq_serial_init()
    }
*/
    /**
     * return the IP of your Obloq 
     * 取得Obloq的IP
    */ 
    //% weight=97 group="01_System"
    //% blockId=getObloq_IP blockGap=5
    //% block="get Obloq IP address"
    export function getObloq_IP(): string {
        if (OBLOQ_SERIAL_INIT && OBLOQ_WIFI_CONNECTED)
            return OBLOQ_IP
        else
            return ""
    }

    /**
     * return the city ID in the world 
     * 取得某個全球大都市的城市編號
    */ 
    //% weight=95 group="02_Weather"
    //% blockId=getCityID blockGap=5
    //% block="get City ID of %myCity"
    export function getCityID(myCity: cityIDs): string {
        return ("" + myCity)
    }

    /**
     * return the city ID in Taiwan 
     * 取得台灣某個都市或是縣的城市編號
    */ 
    //% weight=94 group="02_Weather"
    //% blockId=getCity2ID blockGap=5
    //% block="get City ID of %myCity | in Taiwan"
    export function getCity2ID(myCity: city2IDs): string {
        return ("" + myCity)
    }

    /**
     * return the weather information about the city from http://openweathermap.org/ 
     * 取得從 http://openweathermap.org/ 得到的某一項氣象資訊
    */
    //% weight=93 group="02_Weather"
    //% blockId=getWeatherInfo blockGap=5
    //% block="get weather data: %myInfo"
    export function getWeatherInfo(myInfo: wType): string {
        return wInfo[myInfo][2]
    }

    /**
     * connect to https://openweathermap.org/ to get the weather information
     * You have to enter the City ID and your access key of the website
     * 連接到 https://openweathermap.org/ 取得氣象資訊
     * 你必須輸入城市編號以及你在這個網站註冊取得的存取密碼才能查詢該城市的氣象資訊
     * @param myID to myID ,eg: "City Number"
     * @param myKey to myKey ,eg: "access key"
    */
    //% weight=96 group="02_Weather"
    //% blockId=setWeatherHttp blockGap=5
    //% block="set city ID to get the weather information: %myID | OpenWeatherMap key: %myKey"
    export function setWeatherHttp(myID: string, myKey: string): void {
        Obloq_serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        cityID = myID
        weatherKey = myKey
        let item = ""
        let returnCode = ""
        let tempNumber = 0
        let tempStr = ""
        let myUrl = "http://api.openweathermap.org:80/data/2.5/weather?id=" + cityID + "&appid=" + weatherKey
        serial.readString()
        obloqWriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200") {
            for (let i = 0; i < wInfo.length; i++) {
                item = serial.readUntil(":")
                while (item.indexOf(wInfo[i][1]) < 0) {
                    item = serial.readUntil(":")
                }
                item = serial.readUntil(",")
                switch (wInfo[i][3]) {
                    case "s":
                        wInfo[i][2] = item.substr(1, item.length - 2)
                        break
                    case "k":
                        if (item.indexOf("}") != -1) {
                            item = item.substr(0, item.length - 1)
                        }
                        wInfo[i][2] = "" + Math.round(parseFloat(item) - 273.15)
                        break
                    case "n":
                        if (item.indexOf("}") != -1) {
                            item = item.substr(0, item.length - 1)
                        }
                        wInfo[i][2] = item
                        break
                    default:
                        wInfo[i][2] = item.substr(1, item.length - 2)
                }
            }
            let riseTime = parseFloat(wInfo[7][2])
            let setTime = parseFloat(wInfo[8][2])
            let timeZone = parseFloat(wInfo[9][2])
            riseTime += timeZone
            setTime += timeZone
            wInfo[7][2] = getTimeStr(riseTime)
            wInfo[8][2] = getTimeStr(setTime)
            basic.showIcon(IconNames.Yes)
        }
        else {
            for (let i = 0; i < wInfo.length; i++) {
                wInfo[i][2] = ""
            }
            basic.showIcon(IconNames.No)
        }
    }

    /**
     * connect to https://thingspeak.com/ to store the data from micro:bit
     * 連接到 https://thingspeak.com/ 儲存micro:bit所得到的感應器資料
    */
    //% weight=92 group="03_ThingSpeak"
    //% blockId=saveToThingSpeak blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="send data to ThingSpeak :| write key: %myKey field1: %field1 || field2: %field2 field3: %field3 field4: %field4 field5: %field5 field6: %field6 field7: %field7 field8: %field8"
    export function saveToThingSpeak(myKey: string, field1:number, field2?:number, field3?:number, field4?:number, field5?:number, field6?:number, field7?:number, field8?:number): void {
        Obloq_serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        let returnCode=""
        let myArr:number[]=[field1,field2,field3,field4,field5,field6,field7,field8]
        let myUrl = "http://api.thingspeak.com/update?api_key=" + myKey
        for(let i=0;i<myArr.length;i++)
        {
            if (myArr[i]!=null)
                myUrl+="&field"+(i+1)+"="+myArr[i]
            else
                break
        }
        serial.readString()
        obloqWriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200")
            basic.showIcon(IconNames.Yes)
        else
            basic.showIcon(IconNames.No)
    }

    /**
     * connect to IFTTT to trig some event and notify you
     * 連接到IFTTT觸發其他事件
    */
    //% weight=91 group="04_IFTTT"
    //% blockId=sendToIFTTT blockGap=5
    //% expandableArgumentMode"toggle" inlineInputMode=inline
    //% block="send data to IFTTT to trig other event:| event name: %eventName| your key: %myKey || value1: %value1 value2: %value2 value3: %value3"
    export function sendToIFTTT(eventName:string, myKey: string, value1?:number, value2?:number, value3?:number): void {
        Obloq_serial_init()
        basic.showLeds(`
        . . . . .
        . . . . .
        . # # # .
        . . . . .
        . . . . .
        `)
        let returnCode=""
        let myArr:number[]=[value1,value2,value3]
        let myUrl = "http://maker.ifttt.com/trigger/"+eventName+"/with/key/" + myKey+"?"
        for(let i=0;i<myArr.length;i++)
        {
            if (myArr[i]!=null)
                myUrl+="&value"+(i+1)+"="+myArr[i]
            else
                break
        }
        serial.readString()
        obloqWriteString("|3|1|" + myUrl + "|\r")
        for (let i = 0; i < 3; i++) {
            returnCode = serial.readUntil("|")
        }
        if (returnCode == "200")
            basic.showIcon(IconNames.Yes)
        else
            basic.showIcon(IconNames.No)
    }
}
