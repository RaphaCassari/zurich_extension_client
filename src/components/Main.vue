<template>
  <div>
    <div>
      <div class="row mt-1 ml-2">
        <v-btn
          class="ma-2 ml-1 col-4"
          color="normal"
          @click="changeStatus()"
          v-if="this.manual_review.status == 1 && !this.reopened"
        >
          <v-icon dark left> mdi-arrow-right-drop-circle-outline </v-icon>

          Iniciar Revisão
        </v-btn>
        <v-btn
          class="ma-2 ml-1 col-4"
          color="normal"
          @click="changeStatus()"
          v-if="this.manual_review.status == 1 && this.reopened"
        >
          <v-icon dark left> mdi-arrow-right-drop-circle-outline </v-icon>

          Reabrir Revisão
        </v-btn>
        <v-btn
          class="ma-2 ml-1 col-4"
          color="secondary"
          @click="changeStatus()"
          v-if="this.manual_review.status == 2"
        >
          <v-icon dark left> mdi-pause-octagon-outline </v-icon>
          Finalizar Revisão
        </v-btn>
        <v-autocomplete
          class="col-7"
          v-model="analyst_name"
          :items="analysts"
          label="Analista Principal"
          :disabled="this.manual_review.status == 1"
        ></v-autocomplete>

        <v-btn
          class="ma-2 ml-1 col-4"
          color="normal"
          :disabled="this.manual_review.status == 1"
          @click="onCommentClick()"
        >
          <v-icon dark left> mdi-file-plus </v-icon>
          Adicionar Comentario
        </v-btn>
        <v-btn
          class="ma-2 col-4"
          color="primary"
          @click="onReviewLeakageClick()"
          :disabled="this.manual_review.status == 1"
        >
          <v-icon dark left> mdi-message-draw </v-icon>Revisar Leakage
        </v-btn>
        <v-switch
          class="ma-2 ml-9"
          v-model="isR2"
          inset
          :label="isR2 ? 'R2' : 'R1'"
        ></v-switch>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import bus from "../utils/bus";
import config from "../utils/config";

export default {
  data() {
    return {
      title: "Manual review",
      isR2: false,
      manual_review: {
        sise_key: null,
        user_name: null,
        status: 1,
        created_at: null,
      },
      analysts: [],
      analyst_name: null,
      reopened: false,
    };
  },
  methods: {
    getValueFromDataTable(dataTable, fieldName) {
      let col = dataTable._columns.find((col) => {
        if (col._fieldName.includes("(")) {
          let _fieldName = col._fieldName.substring(
            col._fieldName.indexOf("(") + 1,
            col._fieldName.length - 1
          );
          return _fieldName == fieldName;
        }
        return col._fieldName == fieldName;
      });
      if (typeof col != "undefined") {
        return dataTable._data[0][col._index]._value;
      } else {
        return null;
      }
    },
    async configure() {
      const popupUrl = `${window.location.origin}/zurich_extension_client/#/configure`;
      await tableau.extensions.ui
        .displayDialogAsync(popupUrl, "JSON.stringify(dataTable)", {
          height: 750,
          width: 500,
        })
        .then((closePayload) => {
          console.log(closePayload);
        })
        .catch((error) => {
          switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
              console.log("Dialog was closed by user");
              break;
            default:
              console.error(error.message);
          }
        });
    },
    onReviewLeakageClick() {
      let ref = this;
      const popupUrl = `${window.location.origin}/zurich_extension_client/#/review_leakage`;
      const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === tableau.extensions.settings.get("LEAKAGE_WORKSHEET")
      );
      worksheet.getSummaryDataAsync().then(function (dataTable) {
        // console.log(dataTable)
        tableau.extensions.ui
          .displayDialogAsync(popupUrl, JSON.stringify(dataTable), {
            height: 500,
            width: 500,
          })
          .then((closePayload) => {
            console.log(closePayload);
          })
          .catch((error) => {
            switch (error.errorCode) {
              case tableau.ErrorCodes.DialogClosedByUser:
                console.log("Dialog was closed by user");
                break;
              default:
                console.error(error.message);
            }
          });
      });
    },
    onCommentClick() {
      let ref = this;
      const popupUrl = `${window.location.origin}/zurich_extension_client/#/comment`;
      const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === tableau.extensions.settings.get("VALIDATION_WORKSHEET")
      );
      worksheet.getSummaryDataAsync().then(function (dataTable) {
        dataTable["analystName"] = ref.analyst_name;
        dataTable["analysts"] = ref.analysts;
        tableau.extensions.ui
          .displayDialogAsync(popupUrl, JSON.stringify(dataTable), {
            height: 400,
            width: 800,
          })
          .then((closePayload) => {
            console.log(closePayload);
          })
          .catch((error) => {
            switch (error.errorCode) {
              case tableau.ErrorCodes.DialogClosedByUser:
                console.log("Dialog was closed by user");
                break;
              default:
                console.error(error.message);
            }
          });
      });
    },
    addValidationEventHandler() {
      //adiciona escuta o evento de clique na planilha de detalhes
      const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === tableau.extensions.settings.get("VALIDATION_WORKSHEET")
      );

      const worksheet_manualReview = tableau.extensions.dashboardContent.dashboard.worksheets.find(
        (w) => w.name === tableau.extensions.settings.get("MANUAL_REVIEW_WORKSHEET")
      );

      worksheet.addEventListener(
        tableau.TableauEventType.MarkSelectionChanged,
        (markSelectionEvent) => {
          markSelectionEvent.getMarksAsync().then((marks) => {
            const dataTable = marks.data[0];
            if (dataTable.totalRowCount == 1) {
              const popupUrl = `${window.location.origin}/zurich_extension_client/#/review_validation`;
              tableau.extensions.ui
                .displayDialogAsync(popupUrl, JSON.stringify(dataTable), {
                  height: 450,
                  width: 500,
                })
                .then((closePayload) => {
                  // console.log(closePayload)
                })
                .catch((error) => {
                  switch (error.errorCode) {
                    case tableau.ErrorCodes.DialogClosedByUser:
                      console.log("Dialog was closed by user");
                      break;
                    default:
                      console.error(error.message);
                  }
                });
            }
          });
        }
      );

      worksheet_manualReview.addEventListener(
        tableau.TableauEventType.MarkSelectionChanged,
        (markSelectionEvent) => {
          markSelectionEvent.getMarksAsync().then((marks) => {
            const dataTable = marks.data[0];
            dataTable["analystName"] = this.analyst_name;
            console.log(dataTable);
            if (dataTable.totalRowCount == 1) {
              const popupUrl = `${window.location.origin}/zurich_extension_client/#/manual_review`;
              tableau.extensions.ui
                .displayDialogAsync(popupUrl, JSON.stringify(dataTable), {
                  height: 490,
                  width: 500,
                })
                .then((closePayload) => {
                  // console.log(closePayload)
                })
                .catch((error) => {
                  switch (error.errorCode) {
                    case tableau.ErrorCodes.DialogClosedByUser:
                      console.log("Dialog was closed by user");
                      break;
                    default:
                      console.error(error.message);
                  }
                });
            }
          });
        }
      );
    },
    changeStatus() {
      this.manual_review.created_at = new Date(Date.now()).toISOString();
      axios
        .get(`${config.AWS_URL}/get_status?sise_key=${this.manual_review.sise_key}`)
        .then((res) => {
          if (res.data == "nothing") {
            axios.post(`${config.AWS_URL}/create_status`, this.manual_review);
          } else {
            axios.post(`${config.AWS_URL}/update_status`, this.manual_review);
          }
        });
      if (this.manual_review.status == 1) {
        this.manual_review.status = 2;
        this.addValidationEventHandler();
      } else {
        this.reopened = true;
        this.manual_review.status = 1;
      }
    },
    changeStage() {
      axios.post(`${config.AWS_URL}/update_stage`, {
        sise_key: this.manual_review.sise_key,
        stage: this.isR2 ? 2 : 1,
      });
    },
  },
  watch: {
    isR2(val) {
      this.changeStage();
    },
  },
  mounted: function () {
    let ref = this;

    tableau.extensions
      .initializeAsync({ configure: this.configure })
      .then(async function () {
        /*         await tableau.extensions.settings.set("last_analyst_name", "nothing");
        await tableau.extensions.settings.saveAsync();
        tableau.extensions.settings.saveAsync(); */

        const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
          (w) => w.name === tableau.extensions.settings.get("VALIDATION_WORKSHEET")
        );
        worksheet.getSummaryDataAsync().then(function (dataTable) {
          ref.manual_review.sise_key = ref.getValueFromDataTable(
            dataTable,
            tableau.extensions.settings.get("MANUAL_REVIEW_SISE_KEY")
          );
          ref.manual_review.user_name = ref.getValueFromDataTable(
            dataTable,
            tableau.extensions.settings.get("MANUAL_REVIEW_USER")
          );
          axios
            .get(`${config.AWS_URL}/get_status?sise_key=${ref.manual_review.sise_key}`)
            .then((res) => {
              if (res.data == "nothing") {
                ref.manual_review.status = 1;
              } else if (res.data[0].status == 1) {
                ref.reopened = true;
              } else {
                ref.manual_review.status = 2;
                ref.addValidationEventHandler();
              }
            });

          axios
            .get(`${config.AWS_URL}/get_stage?sise_key=${ref.manual_review.sise_key}`)
            .then((res) => {
              ref.isR2 = res.data[0].stage == 2;
            });
        });

        //TODO: só executar o restante do código quando clicar no botão "iniciar revisão"
        // Encapsular o código abaixo em um metodo e chamar ele por meio da função watch que válida se o manual_revuew.status == 2

        //inicializa variáveis de configuração
        //let first_setup = tableau.extensions.settings.get("first_setup");
        /*     if (typeof first_setup == "undefined") {
      ref.configure().then((t) => {
        ref.addValidationEventHandler();
      });
    } else { */
        //ref.addValidationEventHandler();
        //}

        let worksheet_analysts = tableau.extensions.dashboardContent.dashboard.worksheets.find(
          (w) => w.name === "Supp_analista" // TODO (selecionar ela nas configs configs) ->  settings.worksheet
        );
        worksheet_analysts.getSummaryDataAsync().then(function (sumdata) {
          sumdata.data.forEach((element) => {
            ref.analysts.push(element[0]._value);
          });
          ref.analysts = ref.analysts
            .filter((i) => {
              return i;
            })
            .sort();
        });
        let worksheet2 = tableau.extensions.dashboardContent.dashboard.worksheets.find(
          (w) => w.name === "DETALHE1"
        );
        worksheet2.getSummaryDataAsync().then(function (sumdata) {
          ref.analyst_name = sumdata.data[0][1]._value;
        });
      });
  },
};
</script>
