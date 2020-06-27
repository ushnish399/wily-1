import React from 'react';
import {Text, View, TouchableOpacity, FlatList, StyleSheet, TextInput} from 'react-native';
import db from '../config';

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={allTransactions:[], search:'', lastVisibleTransaction:null}
    }

    fetchMoreTransactions= async()=>{
       var text=this.state.search.toUpperCase();
       var enteredText=text.split('');
       if(enteredText[0].toUpperCase()==='B'){
           const query=await db.collection("transactions").where('bookId', '==', text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
           query.docs.map((doc)=>{
               this.setState({
                   allTransactions:[...this.state.allTransactions, doc.data()],
                   lastVisibleTransaction: doc
               })
           })
       }
       else if(enteredText[0].toUpperCase()==='S'){
        const query=await db.collection("transactions").where('studentId', '==', text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions:[...this.state.allTransactions, doc.data()],
                lastVisibleTransaction: doc
            })
        })
    }

    }

    searchTransactions= async(text)=>{
       
        var enteredText=text.split('');
        var text= text.toUpperCase();
        if(enteredText[0].toUpperCase()==='B'){
            const query=await db.collection("transactions").where('bookId', '==', text).get();
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions, doc.data()],
                    lastVisibleTransaction: doc
                })
            })
        }
        else if(enteredText[0].toUpperCase()==='S'){
         const query=await db.collection("transactions").where('studentId', '==', text).get();
         query.docs.map((doc)=>{
             this.setState({
                 allTransactions:[...this.state.allTransactions, doc.data()],
                 lastVisibleTransaction: doc
             })
         })
     }
 
     }
    
     componentDidMount= async()=>{
         const query= await db.collection("transactions").limit(10).get();
         query.docs.map((doc)=>{
             this.setState({
                 allTransactions:[], 
                 lastVisibleTransaction:doc
             })
         })
     }

    render(){
        return(
           <View style={styles.container}>
               <View style={styles.searchBar}>
                   <TextInput style={styles.bar} placeholder='ENTER BOOK ID OR STUDENT ID' onChangeText={(text)=>{this.setState({search: text})}}></TextInput>
                   <TouchableOpacity style={styles.searchButton} onpress={()=>{this.searchTransactions(this.state.search)}}>
                       <Text>SEARCH</Text>
                   </TouchableOpacity>
               </View>
               <FlatList data={this.state.allTransactions} renderItem={({item})=>(
                   <View style={{borderBottomWidth:2}}>
                          <Text>{'BOOK ID:'+ item.bookId}</Text>
                          <Text>{'STUDENT ID:'+ item.studentId}</Text>
                          <Text>{'TRANSACTION TYPE:'+ item.transactionType}</Text>
                          <Text>{'DATE:'+ item.date.toDate()}</Text>
                       </View>
               )} keyExtractor={(item, index)=>index.toString()}
               onEndReached={this.fetchMoreTransactions}
               onEndReachedThreshold={0.7}/>
               
               </View>
        )
    }

}
const styles=StyleSheet.create({
    container:{flex:1, marginTop:20},
    searchBar:{flexDirection:'row', height:40, width:'auto', borderWidth:0.5, alignItems:'center', backgroundColor:'grey'},
    bar:{borderWidth:2, height:30, width:300, paddingLeft:10},
    searchButton:{borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green'},
})