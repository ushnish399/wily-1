import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, TextInput} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default class BookTransaction extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermission: null,
            scanned: false,
            scannedBookId: '',
            scannedStudentId:'',
            buttonState: 'normal',
        }
    }

    getPermissionsAsync = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted', buttonState:id, scanned:'false', });
      };

      handleBarcodeScanned=async({type,data})=>{
          const{buttonState}=this.state;
          if(buttonState==="BookId"){
              this.setState({scanned:'true', scannedBookId:data, buttonState:'normal'})
          }
          else if(buttonState==="StudentId"){
              this.setState({scanned:'true', scannedStudentId:data, buttonState:'normal'})
          }
      }

    render(){
        const hasCameraPermission= this.state.hasCameraPermission
        const scanned= this.state.scanned
        const buttonState= this.state.buttonState
        if(buttonState!=='normal'&& hasCameraPermission){
            return(
              <BarcodeScanner onBarcodeScanned={scanned ? undefined :this.handleBarcodeScanned} style={StyleSheet.absoluteFillObject}></BarcodeScanner>
            )
        }
        else if(buttonState==='normal'){
            return(
                <View style={styles.container}>
                    <View>
                        <Image source={require("../assets/booklogo.jpg")} style={{width:200, height:200}}/>
                        <Text style={{textAlign:'center', fontSize:30}}>WILY</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder="BOOK ID" value={this.state.scannedBookId}></TextInput>
                        <TouchableOpacity style={styles.scannedButton} onPress={()=>{this.getPermissionsAsync("BookId")}}>
                            <Text style={styles.buttonText}>SCAN</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder="STUDENT ID" value={this.state.scannedStudentId}></TextInput>
                        <TouchableOpacity style={styles.scannedButton} onPress={()=>{this.getPermissionsAsync("StudentId")}}>
                            <Text style={styles.buttonText}>SCAN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
       
    }
}
const styles=StyleSheet.create({
  container:{flex:1,justifyContent:'center', alignItems:'center'},
  displayText:{fontSize:50, textDecorationLine:'underline'},
  scannedButton:{backgroundColor:'blue', padding:10, margin:10, width:50, borderWidth:1.5, borderLeftWidth:1.0},
  buttonText:{fontSize:15, textAlign:'center', marginTop:10},
  inputView:{flexDirection:'row', margin:20},
  inputBox:{width:200, height:40, borderWidth:1.5, borderRightWidth:0, fontSize:20},

})