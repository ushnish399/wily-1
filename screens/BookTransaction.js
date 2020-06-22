import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Image, TextInput, KeyboardAvoidingView, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config.js';
import firebase from 'firebase';


export default class BookTransaction extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermission: null,
            scanned: false,
            scannedBookId: '',
            scannedStudentId:'',
            buttonState: 'normal',
            transactionMessege:'',
        }
    }

    handleTransaction= async()=>{
        var transactionType=await this.checkBookEligibility();
        if(!transactionType){
            Alert.alert("the book does not exist in the database");
            this.setState({scannedStudentId:'', scannedBookId:''});
        }
        else if(transactionType==='issue'){
            var isStudentEligible= await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert("book issued to the student");
            }
        
        }
        else {
            var isStudentEligible=await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert("book returned to the librarian");
            }
        }
        
     }
     checkStudentEligibilityForBookIssue= async()=>{
         const studentRef=await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
         var isStudentEligible="";
         if(studentRef.docs.length==0){
             this.setState({scannedBookId:'', scannedStudentId:''});
             isStudentEligible= false;
             Alert.alert("student id does not exist in the database");
         }
         else{
             studentRef.docs.map((doc)=>{
                 var student=doc.data();
                 if(student.numberOfBooksIssued<2){
                     isStudentEligible= true;
                 }
                 else{
                     isStudentEligible= false;
                     Alert.alert("student has already issued two books");
                     this.setState({scannedStudentId:'', scannedBookId:''});
                 }
             })
         }
         return isStudentEligible;

         
     }
     checkStudentEligibilityForBookReturn= async()=>{
        const TransactionRef=await db.collection("transaction").where("bookId", "==", this.state.scannedBookId).limit(1).get()
        var isStudentEligible="";
        TransactionRef.docs.map((doc)=>{
            var lastBookTransaction=doc.data();
            if(lastBookTransaction.studentId==this.state.scannedStudentId){
                isStudentEligible= true;
            }
            else{
                isStudentEligible= false;
                Alert.alert("the book was not issued by the student");
                this.setState({scannedStudentId:'', scannedBookId:''});
            }
        })
        return isStudentEligible;
     }
   
     checkBookEligibility= async()=>{
         const bookRef= await db.collection("books").where("bookId", "==", this.state.scannedBookId).get();
         var transactionType='';
         if(bookRef.docs.length==0){
             transactionType= false;
         }
         else{
             bookRef.docs.map((doc)=>{
                 var book=doc.data();
                 if(book.bookAvailability){
                     transactionType='issue';
                 }
                 else{
                     transactionType='return';
                 }
             })
         }
         return transactionType;
     }

     initiateBookIssue= async()=>{
         console.log("ISSUE");
         db.collection("transaction").add({
             'studentId':this.state.scannedStudentId,
             'bookId':this.state.scannedBookId,
             'date':firebase.firestore.Timestamp.now().toDate(),
             'transactionType':'issue'
         })
         db.collection("books").doc(this.state.scannedBookId).update({'bookAvailability':false})
         db.collection("students").doc(this.state.scannedStudentId).update({'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)})
         this.setState({
             scannedStudentId:'',
             scannedBookId:'',
         })
     }

     initiateBookReturn= async()=>{
        db.collection("transaction").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':'return'
        })
        db.collection("books").doc(this.state.scannedBookId).update({'bookAvailability':true})
        db.collection("students").doc(this.state.scannedStudentId).update({'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)})
        this.setState({
            scannedStudentId:'',
            scannedBookId:'',
        })
    }

    getPermissionsAsync = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted', buttonState:id, scanned:false, });
      };

      handleBarcodeScanned=async({type,data})=>{
          const{buttonState}=this.state;
          if(buttonState==="BookId"){
              this.setState({scanned:true, scannedBookId:data, buttonState:'normal'})
          }
          else if(buttonState==="StudentId"){
              this.setState({scanned:true, scannedStudentId:data, buttonState:'normal'})
          }
      }

    render(){
        const hasCameraPermission= this.state.hasCameraPermission
        const scanned= this.state.scanned
        const buttonState= this.state.buttonState
        if(buttonState!=='normal'&& hasCameraPermission){
            return(
              <BarCodeScanner onBarCodeScanned={scanned ? undefined :this.handleBarcodeScanned} style={StyleSheet.absoluteFillObject}></BarCodeScanner>
            )
        }
        else if(buttonState==='normal'){
            return(
                <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
             
                    <View>
                        <Image source={require("../assets/booklogo.jpg")} style={{width:200, height:200}}/>
                        <Text style={{textAlign:'center', fontSize:30}}>WILY</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder="BOOK ID" value={this.state.scannedBookId} onChangeText={(text)=>{this.setState({scannedBookId:text})}}></TextInput>
                        <TouchableOpacity style={styles.scannedButton} onPress={()=>{this.getPermissionsAsync("BookId")}}>
                            <Text style={styles.buttonText}>SCAN</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder="STUDENT ID" value={this.state.scannedStudentId} onChangeText={(text)=>{this.setState({scannedStudentId:text})}}></TextInput>
                        <TouchableOpacity style={styles.scannedButton} onPress={()=>{this.getPermissionsAsync("StudentId")}}>
                            <Text style={styles.buttonText}>SCAN</Text>
                        </TouchableOpacity>
                    </View>
            <Text style={styles.transactionAlert}>{this.state.transactionMessege}</Text>
            <TouchableOpacity style={styles.submitButton} onPress={async()=>{var transactionMessage=await this.handleTransaction();}}>
                <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>
               </KeyboardAvoidingView>
            )
        }
       
    }
}
const styles=StyleSheet.create({
  container:{flex:1,justifyContent:'center', alignItems:'center'},
  displayText:{fontSize:50, textDecorationLine:'underline'},
  scannedButton:{backgroundColor:'blue',  width:50, borderWidth:1.5, borderLeftWidth:1.0},
  buttonText:{fontSize:15, textAlign:'center', marginTop:10},
  inputView:{flexDirection:'row', margin:20},
  inputBox:{width:200, height:40, borderWidth:1.5, borderRightWidth:0, fontSize:20},
  submitButton:{backgroundColor:'red', width:100, height:50},
  submitButtonText:{padding:10, textAlign:'center', fontSize:20, fontWeight:'bold', color:'white'},

})