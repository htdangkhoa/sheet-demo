import React, { useCallback, useEffect, useRef } from "react";
import { useScript } from "../hooks/useScript";
import { useStylesheet } from "../hooks/useStylesheet";
// @ts-ignore
import luckysheet from "luckysheet/src/index.js";
// @ts-ignore
import dataVerificationCtrl from "luckysheet/src/controllers/dataVerificationCtrl";

const SEEDS_DATA = [
  ["Network name", "Ad unit", "Mediation group", "Instance Rate", "Notes"],
  [
    {
      optionItem: {
        type: "dropdown",
        value1: ["Applovin", "Google Admob", "Google Ad Manager"].join(","),
        // hintShow: true,
        // hintText: "Please select a network",
        prohibitInput: true,
        checked: true,
        remote: false,
      },
      options: {
        range: "A2:A9999",
      },
    },
    {
      optionItem: {
        type: "dropdown",
        value1: ["Rewarded", "Banner", "Interstitial"].join(","),
        // hintShow: true,
        // hintText: "Please select a ad unit",
        prohibitInput: true,
        checked: true,
        remote: false,
      },
      options: {
        range: "B2:B9999",
      },
    },
    undefined,
    {
      optionItem: {
        type: "number_integer",
        type2: "bw",
        value1: "0",
        value2: "1000",
        // hintShow: true,
        // hintText: "Please enter a number between 0 and 1000",
        prohibitInput: true,
        remote: false,
      },
      options: {
        range: "D2:D9999",
      },
    },
  ],
];

const Sheet = () => {
  useStylesheet("https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css");
  useStylesheet("https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css");
  useStylesheet("https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css");
  useStylesheet("https://cdn.jsdelivr.net/npm/luckysheet/dist/assets/iconfont/iconfont.css");

  const isPluginLoaded = useScript("https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/js/plugin.js");
  // const isLuckysheetLoaded = useScript("https://cdn.jsdelivr.net/npm/luckysheet/dist/luckysheet.umd.js");
  const isLuckysheetLoaded = true;

  const ref = useRef<any>();

  const initWorksheet = useCallback(() => {
    const [headers, verifications] = SEEDS_DATA;

    headers.forEach((header, index) => {
      luckysheet.setCellValue(0, index, header);
    });

    verifications.forEach((verification, index) => {
      if (!verification) return;
      // @ts-ignore
      const { optionItem, options } = verification;
      luckysheet.setDataVerification(optionItem, options);
    });
  }, []);

  useEffect(() => {
    if (isPluginLoaded && isLuckysheetLoaded) {
      const options = {
        container: ref.current.id,
        showinfobar: false,
        column: 5,
        paste: false,
        data: [
          {
            name: "Sheet1",
            color: "",
            index: 1,
            status: 0,
            order: 1,
            celldata: [],
            config: {},
          },
        ],
        hook: {
          workbookCreateAfter: () => {
            // console.log("workbookCreateAfter");
            document.querySelector<HTMLDivElement>("#luckysheet-icon-print")!.remove();
            initWorksheet();
          },
          sheetActivate: (index: number | string, isPivotInitial: boolean, isNew: boolean) => {
            // console.log("sheetActivate", index, isPivotInitial, isNew);

            const currentSheet = luckysheet.getSheet({ index });
            if (currentSheet && !currentSheet.dataVerification && isNew) {
              // console.log("initWorksheet");

              setTimeout(initWorksheet, 0);
            }
          },
        },
      };
      luckysheet.create(options);
      // console.log(luckysheet.getAllSheets());
    }

    return () => {
      luckysheet?.destroy?.();
      ref.current.innerHTML = "";
    };
  }, [isPluginLoaded, isLuckysheetLoaded]);

  const validate = useCallback(() => {
    // console.log(luckysheet.getCellValue(1, 1));
    const sheets = luckysheet.getAllSheets();

    const { errors, data } = sheets.reduce(
      (acc: any, { data: tableData, name }: any) => {
        const [headers, ...data] = tableData;

        const finalData = data.filter((row: any[]) => {
          const columns = [...row];
          columns.pop();

          const validators = SEEDS_DATA[1];
          const columnValue = columns
            .filter((c, i) => {
              if (!c) return false;

              // @ts-ignore
              const { optionItem, options } = validators[i] || {};

              return dataVerificationCtrl.validateCellData(c?.v, {
                ...optionItem,
                ...options,
              });
            })
            .filter(Boolean).length;

          return 0 < columnValue && columnValue === headers.length - 1;
        });

        if (!finalData.length) {
          acc.errors.push({
            sheet: name,
            message: "Invalid data",
          });
        } else {
          acc.data.push({
            sheet: name,
            workbook: finalData,
          });
        }

        return acc;
      },
      {
        errors: [],
        data: [],
      },
    );

    if (errors.length) {
      const message = errors.map(({ sheet, message }: any) => `${sheet}: ${message}`).join("\n");
      alert(message);
    } else {
      data.forEach(({ sheet, workbook }: any) => {
        console.log("Sheet:", sheet);
        const table = workbook.map((row: any[]) => {
          const columns = [...row];

          return columns.filter(Boolean).reduce((acc: any, column: any, index: number) => {
            const headers = SEEDS_DATA[0];
            // @ts-ignore
            acc[headers[index]] = column.v;
            return acc;
          }, {});
        });
        console.table(table);
      });
    }
  }, []);

  return (
    <div id="sheet-container">
      <div
        id="luckysheet"
        ref={ref}
        style={{
          margin: 0,
          padding: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      <div className="flex absolute bottom-0 right-0 bg-slate-600 text-white">
        <button onClick={validate}>Validate</button>
      </div>
    </div>
  );
};

export default Sheet;
