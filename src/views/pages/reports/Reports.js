import React, { useState, useEffect, Component } from 'react'
//import { CToast, CToastBody, CToastHeader } from '@coreui/react'
//import ReportBro from 'react-reportbro-designer'
//import reactReportbroDesigner from 'https://cdn.jsdelivr.net/npm/react-reportbro-designer@1.0.4/+esm'
//import ReportBro from 'react-reportbro-designer';
//import ReportDesigner from 'react-reportbro-designer';
//import { Designer } from "@mescius/activereportsjs-react";
import { Viewer } from '@mescius/activereportsjs-react';


// import { ReportBroMain2 } from 'react-reportbro-designer';

const data = {
  "Name": "report-test",
  "Body": {
    "ReportItems": [
      {
        "Type": "textbox",
        "Name": "TextBox1",
        "Value": "Testing the textbox!",
        "Style": {
          "FontSize": "20pt"
        },
        "Width": "8.5in",
        "Height": "1.5in"
      }
    ]
  }
};


class Reports extends Component {
  constructor(props) {
    super(props);
    this.state = { zoom: 100 };
  }

    handleZoomChange = (newZoom) => {
      // setZoom(newZoom);
      this.setState({ zoom: newZoom });
    };

  render(){
  //console.log(reactReportbroDesigner);
    //return (<ReportDesigner />)

    const { zoom }= this.state;

  return (
    <Viewer
      width="100%"
      height="800px"
    theme="dark"
      toolbar={['export', 'print']}
    allowAnnotations={true}
    report={data}

      // ... other props
      zoom={zoom}
      onZoomChange={this.handleZoomChange}
    />
  );

  return (
    <div>
       <Designer
        report={{ id: "blank.rdlx-json", displayName: "my report" }}
      ></Designer>
    </div>
  )
}
}



export default Reports
