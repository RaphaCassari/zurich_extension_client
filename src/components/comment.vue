<template>
  <v-container>
    <template>
      <v-container fluid class="text-right">
        <v-row>
          <v-col cols="4">
            <v-autocomplete
              v-model="manual_review.analystName"
              :items="analysts"
              label="Analista Principal"
            ></v-autocomplete>
          </v-col>
          <v-col cols="4">
            <v-autocomplete
              v-model="manual_review.analystName2"
              :items="analysts"
              label="Analista Secundario"
            ></v-autocomplete>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="manual_review.period"
              :items="periodos"
              label="Periodo"
              :rules="notEmptyRule"
            ></v-select>
          </v-col>
        </v-row>

        <v-row v-if="manual_review.analystName2 == ''">
          <v-col cols="12" md="6">
            <v-textarea
              filled
              name="input-7-4"
              label="Comentário Geral"
              v-model="manual_review.comment"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="6" md="6">
            <v-textarea
              filled
              name="input-7-4"
              label="Comentário Analista Principal"
              v-model="manual_review.comment"
            ></v-textarea>
          </v-col>
          <v-col cols="6" md="6">
            <v-textarea
              filled
              name="input-7-4"
              label="Comentário Analista Segundario"
              v-model="manual_review.comment2"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-btn
          class="ma-2 ml-1"
          color="primary"
          @click="send()"
          :disabled="manual_review.comment == '' || manual_review.period == null"
        >
          Adicionar Comentario
        </v-btn>
      </v-container>
    </template>
  </v-container>
</template>
<script>
import axios from "axios";
import bus from "../utils/bus";
import config from "../utils/config";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      periodos: [],
      firstComment: true,
      analysts: [],
      manual_review: {
        comment: "",
        comment2: "",
        created_at: null,
        sise_key: null,
        user_name: null,
        analystName: "",
        analystName2: "",
        coverage_id: null,
        period: null,
      },
    };
  },
  methods: {
    send() {
      if (this.firstComment) {
        axios.post(`${config.AWS_URL}/create_comment`, this.manual_review).then((res) => {
          const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
            (w) => w.name === "DETALHE2"
          );
          worksheet.getDataSourcesAsync().then((datasources) => {
            const datasource = datasources.find(
              (d) =>
                d.name === tableau.extensions.settings.get("MANUAL_REVIEW_DATASOURCE")
            );
            datasource.refreshAsync().then(() => {
              Swal.fire(
                "Comentario Enviado!",
                "Feedback enviado por E-mail",
                "success"
              ).then(() => {
                tableau.extensions.ui.closeDialog();
              });
            });
          });
        });
      } else {
        axios
          .post(`${config.AWS_URL}/update_comment`, this.manual_review)
          .then((res) => {
            const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
              (w) => w.name === "DETALHE2"
            );
            worksheet.getDataSourcesAsync().then((datasources) => {
              const datasource = datasources.find(
                (d) =>
                  d.name === tableau.extensions.settings.get("MANUAL_REVIEW_DATASOURCE")
              );
              datasource.refreshAsync().then(() => {
                Swal.fire(
                  "Comentario Enviado!",
                  "Feedback enviado por E-mail",
                  "success"
                ).then(() => {
                  tableau.extensions.ui.closeDialog();
                });
              });
            });
          })
          .catch((err) => console.log(err));
      }
      axios.post(`${config.AWS_URL}/send_email`, this.manual_review);
    },
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
  },
  async mounted() {
    let today = new Date();
    let quarter = Math.floor((today.getMonth() + 3) / 3);
    for (let i = 0; i < quarter; i++) {
      this.periodos.push(today.getFullYear() + " - Q" + (i + 1));
    }
    for (let i = 0; i < 4; i++) {
      this.periodos.push(today.getFullYear() - 1 + " - Q" + (i + 1));
    }
    let ref = this;

    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      let dataTable = JSON.parse(openPayload);
      ref.manual_review.analystName = dataTable.analystName;
      ref.analysts = dataTable.analysts;

      ref.manual_review.sise_key = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("VALIDATION_SISE_KEY_FIELD")
      );

      ref.manual_review.user_name = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("VALIDATION_USER_FIELD")
      );
      ref.manual_review.coverage_id = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("VALIDATION_COVERAGE_ID_FIELD")
      );
      console.log(ref.manual_review, "test");
      console.log(ref.manual_review.analystName);
      ref.manual_review.created_at = new Date(Date.now()).toISOString();

      let url = `${config.AWS_URL}/get_comment?sise_key=${ref.manual_review.sise_key}`;
      axios.get(url, ref.manual_review).then((res) => {
        ref.manual_review.comment = res.data;
        if (res.data != "") {
          ref.firstComment = false;
        }
      });
    });
  },
};
</script>

<style scoped></style>
