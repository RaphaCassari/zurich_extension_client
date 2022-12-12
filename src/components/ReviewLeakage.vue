<template>
  <v-container>
    <v-toolbar color="primary" cards dark flat>
      <v-card-title class="col-6 title font-weight-regular">
        Revisão Leakage
      </v-card-title>
      <v-select
        class="pt-5"
        v-model="manual_review.period"
        :items="periodos"
        label="Periodo"
        :rules="notEmptyRule"
      ></v-select>
    </v-toolbar>
    <v-form ref="form" class="pa-4 pt-6">
      <v-row>
        <v-col cols="6">
          <v-subheader>
            <p class="font-weight-bold">
              Foi identificado Leakage durante a revisão manual?
            </p>
          </v-subheader>
        </v-col>
        <v-col cols="6">
          <v-subheader>
            <v-radio-group
              v-model="manual_review.is_leakage"
              row
              @change="onChangeManualResult($event)"
              :rules="[(v) => !!v || 'Selecione uma opção.']"
            >
              <v-radio label="Sim" value="true"></v-radio>
              <v-radio
                label="Não"
                value="false"
                @click="manual_review.check_value = null"
              ></v-radio>
            </v-radio-group>
          </v-subheader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-subheader>
            <p class="font-weight-bold">
              O valor calculado automaticamente está correto?
            </p>
          </v-subheader>
        </v-col>
        <v-col cols="6">
          <v-subheader>
            <v-radio-group
              v-model="manual_review.check_value"
              row
              :disabled="manual_review.is_leakage != 'true'"
              :rules="validateCheckValueandRootCause"
            >
              <v-radio
                label="Sim"
                value="true"
                @click="
                  manual_review.adjusted_leakage_value =
                    manual_review.calculated_leakage_value
                "
              ></v-radio>
              <v-radio
                label="Não"
                value="false"
                @click="manual_review.adjusted_leakage_value = null"
              ></v-radio>
            </v-radio-group>
          </v-subheader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-subheader>
            <p class="font-weight-bold">Qual o valor do Leakage?</p>
          </v-subheader>
        </v-col>
        <v-col cols="6">
          <v-subheader>
            <v-text-field
              v-model="manual_review.adjusted_leakage_value"
              label="Valor"
              prefix="R$"
              type="number"
              :disabled="manual_review.check_value != 'false'"
              :rules="validateLeakageValue"
            ></v-text-field>
          </v-subheader>
        </v-col>
      </v-row>
      <v-select
        v-model="manual_review.root_cause_leakage_id"
        :items="root_causes"
        item-text="text"
        item-value="value"
        label="Causa raiz"
        :disabled="manual_review.is_leakage != 'true'"
        :rules="validateCheckValueandRootCause"
      ></v-select>
    </v-form>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn text @click="closeDialog()"> Cancelar </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        class="white--text"
        color="primary"
        @click="saveDialog()"
        :disabled="manual_review.period == null"
      >
        Salvar
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>
          Processando...
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="error_dialog">
      {{ error_text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="error_dialog = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
<script>
import axios from "axios";
import bus from "../utils/bus";
import config from "../utils/config";

export default {
  data() {
    return {
      periodos: [],
      manual_review: {
        sise_key: null,
        is_leakage: null,
        check_value: null,
        calculated_leakage_value: null,
        adjusted_leakage_value: null,
        root_cause_leakage_id: null,
        coverage_id: null,
        user: null,
        created_at: null,
        period: null,
      },
      root_causes: [],
      dialog: false,
      error_dialog: false,
      error_text: "",
      validateCheckValueandRootCause: [
        (v) => {
          if (this.manual_review.is_leakage == "false") {
            return true;
          } else {
            return !!v || "Selecione uma opção.";
          }
        },
      ],
      validateLeakageValue: [
        (v) => {
          if (
            this.manual_review.is_leakage == "true" &&
            this.manual_review.check_value == "false"
          ) {
            return !!v || "Selecione uma opção.";
          } else {
            return true;
          }
        },
      ],
      validateRootCause: [
        (v) => {
          if (this.manual_review.is_leakage && v == null) {
            return "Selecione uma opção.";
          } else {
            return true;
          }
        },
      ],
    };
  },
  methods: {
    onChangeManualResult($event) {
      if (this.manual_review.is_leakage == "true") {
        this.fetchRootCauses({ coverage_id: this.manual_review.coverage_id });
      }
    },
    //payload = {coverage_id = val, validation_id = val}
    fetchRootCauses(payload) {
      if (this.root_causes.length == 0) {
        let uri = `${config.AWS_URL}/rootcausesleakage`;
        this.dialog = true;
        if (payload) {
          uri += `?coverage_id=${payload.coverage_id}`;
        }
        axios
          .get(uri)
          .then((response) => {
            this.root_causes = response.data.map((rootcause) => ({
              text: rootcause.description_pt_br,
              value: rootcause.root_cause_leakage_id,
            }));
            console.log(this.root_causes);
            this.dialog = false;
          })
          .catch((error) => {
            this.dialog = false;
            this.error_text = `Erro ao recuperar lista de causas. ${error.message}`;
            this.error_dialog = true;
            throw error;
          });
      }
    },
    closeDialog() {
      tableau.extensions.ui.closeDialog();
    },
    saveDialog() {
      if (this.$refs.form.validate()) {
        this.manual_review.created_at = new Date(Date.now()).toISOString().split(".")[0];
        this.dialog = true;
        let url = `${config.AWS_URL}/manual_review_leakage`;

        axios
          .post(url, this.manual_review)
          .then(() => {
            //atualiza os datasources que são live
            const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(
              (w) => w.name === tableau.extensions.settings.get("LEAKAGE_WORKSHEET")
            );
            worksheet
              .getDataSourcesAsync()
              .then((datasources) => {
                const datasource = datasources.find(
                  (d) =>
                    d.name ===
                    tableau.extensions.settings.get("LEAKAGE_DATASOURCE_TO_REFRESH")
                );
                datasource
                  .refreshAsync()
                  .then(() => {
                    this.dialog = false;
                    tableau.extensions.ui.closeDialog(JSON.stringify(this.manual_review));
                  })
                  .catch((error) => {
                    this.dialog = false;
                    this.error_text = `Erro ao atualizar dados no painel. Entretanto os dados foram salvos. ${error.message}`;
                    this.error_dialog = true;
                    throw error;
                  });
              })
              .catch((error) => {
                this.dialog = false;
                this.error_text = `Erro ao atualizar dados no painel. Entretanto os dados foram salvos. ${error.message}`;
                this.error_dialog = true;
                throw error;
              });
          })
          .catch((error) => {
            this.dialog = false;
            this.error_text = `Erro ao salvar dados no servidor. ${error.message}`;
            this.error_dialog = true;
            throw error;
          });
      }
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
  mounted() {
    let today = new Date();
    let quarter = Math.floor((today.getMonth() + 3) / 3);
    for (let i = 0; i < quarter; i++) {
      this.periodos.push(today.getFullYear() + " - Q" + (i + 1));
    }
    for (let i = 0; i < 4; i++) {
      this.periodos.push(today.getFullYear() - 1 + " - Q" + (i + 1));
    }
    //this.manual_review.period = today.getFullYear() + " - Q" + quarter;

    let ref = this;
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      const dataTable = JSON.parse(openPayload);
      console.log(dataTable);
      ref.manual_review.user = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("LEAKAGE_USER_FIELD")
      );
      ref.manual_review.sise_key = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("LEAKAGE_SISE_KEY_FIELD")
      );
      ref.manual_review.coverage_id = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("VALIDATION_COVERAGE_ID_FIELD")
      );
      let calc_value = ref.getValueFromDataTable(
        dataTable,
        tableau.extensions.settings.get("LEAKAGE_CALCULATED_LEAKAGE_VALUE_FIELD")
      );
      if (calc_value == null) calc_value = 0;
      ref.manual_review.calculated_leakage_value = (
        Math.round(calc_value * 100) / 100
      ).toFixed(0);
    });
  },
};
</script>

<style scoped></style>
