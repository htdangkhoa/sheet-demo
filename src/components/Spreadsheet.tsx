import React, { SyntheticEvent } from "react";

// @ts-ignore
import XSpreadsheet from "x-data-spreadsheet/src/index.js";
import "x-data-spreadsheet/dist/xspreadsheet.css";

const SEEDS_DATA = [
  ["Network name", "Ad unit", "Mediation group", "Instance Rate"],
  [
    {
      mode: "cell",
      operator: "in",
      refs: ["A2:A100"],
      required: true,
      type: "list",
      value: ["Applovin", "Google Admob", "Google Ad Manager"].join(","),
    },
    {
      mode: "cell",
      operator: "in",
      refs: ["B2:B100"],
      required: true,
      type: "list",
      value: ["Rewarded", "Banner", "Interstitial"].join(","),
    },
  ],
];

class Spreadsheet extends React.Component {
  private ref = React.createRef<HTMLDivElement>();

  private s: XSpreadsheet | null = null;

  handleOnClick(e: any) {
    const xSpreadSheet = this.s!.getData();
    console.log("🚀 ~ file: Spreadsheet.tsx ~ line 35 ~ Spreadsheet ~ handleOnClick ~ xSpreadSheet", xSpreadSheet);

    const currentTarget = e.target;
    console.log("🚀 ~ file: Spreadsheet.tsx ~ line 38 ~ Spreadsheet ~ handleOnClick ~ currentTarget", currentTarget);

    if (currentTarget.className === "x-spreadsheet-icon-img add") {
      e.preventDefault();
      e.stopPropagation();
      console.log("add sheet");
      // this.s!.addSheet();
      // return;
      const lastSheet = xSpreadSheet.pop();
      console.log("🚀 ~ file: Spreadsheet.tsx ~ line 47 ~ Spreadsheet ~ handleOnClick ~ lastSheet", lastSheet);
      if (!lastSheet?.validations?.length) {
        // @ts-ignore
        const newSheetIndex = this.s.datas.findIndex((item: any) => item.name === lastSheet.name);
        // @ts-ignore
        const sheetDataProxy = this.s.datas[newSheetIndex];
        console.log(
          "🚀 ~ file: Spreadsheet.tsx ~ line 53 ~ Spreadsheet ~ handleOnClick ~ sheetDataProxy",
          sheetDataProxy,
        );
        /*
        mode: "cell",
      operator: "be",
      refs: ["A2:A100"],
      required: true,
      type: "list",
      value: ["Applovin", "Google Admob", "Google Ad Manager"].join(","),
        */
        const [headers, validations] = SEEDS_DATA;
        headers.forEach((text, index) => {
          // @ts-ignore
          this.s.cellText(0, index, text, newSheetIndex);
        });
        // @ts-ignore
        validations.forEach(({ mode, refs, ...validator }, index) => {
          sheetDataProxy.addValidation(mode, refs[0], validator);
        });
        // @ts-ignore
        this.s.reRender();
      }
    } else if (currentTarget.parentNode.className === "x-spreadsheet-menu") {
      const newSheetIndex = xSpreadSheet.findIndex((item: any) => item.name === currentTarget.innerText);
      console.log("🚀 ~ file: Spreadsheet.tsx ~ line 37 ~ Spreadsheet ~ handleOnClick ~ newSheetIndex", newSheetIndex);
      return newSheetIndex;
    }
  }

  componentDidMount() {
    const s = new XSpreadsheet(this.ref.current as HTMLDivElement);
    this.s = s;

    const [headers, validations] = SEEDS_DATA;

    // @ts-ignore
    s.on("change", (...args) => {
      console.log("on change", args);
    });

    s.change((...args: any[]) => {
      console.log("change", args);
    });

    s.loadData({
      rows: {
        0: {
          cells: headers.map((text) => ({
            text,
          })),
        },
      },
      validations,
    });

    // s.reRender();\

    // @ts-expect-error
    s.sheet.eventMap.on("change", (...args) => {
      console.log("sheet eventMap on change", args);
    });
    // @ts-expect-error
    s.sheet.on("change", (...args) => {
      console.log("sheet on change", args);
    });

    // setTimeout(() => {
    //   // console.log(s.getData());
    //   // @ts-ignore
    //   s.addSheet("dsjakdjsa", false);
    // }, 10000);
  }

  componentWillUnmount() {
    if (this.ref.current) {
      this.ref.current.replaceChildren();
    }
  }

  export() {
    // @ts-ignore
    console.log(this.s.getData());
    const v = this.s.validate();
    console.log("🚀 ~ file: Spreadsheet.tsx ~ line 139 ~ Spreadsheet ~ export ~ v", v);
  }

  render() {
    return (
      <div className="relative">
        <div className="all-initial">
          <div ref={this.ref} onClick={this.handleOnClick.bind(this)} />
        </div>

        <div className="flex absolute bottom-0 right-0">
          <button onClick={this.export.bind(this)}>export</button>
        </div>
      </div>
    );
  }
}

export default Spreadsheet;
