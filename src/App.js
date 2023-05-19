import React, { Component } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const apiUrl = "http://20.231.202.18:8000/api/form";

class App extends Component {
  state = {
    data: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id: "",
      code: "",
      name: '',
      description: ''
    },
    selectedFormId: "",
    searchTerm: ""
  };

  componentDidMount() {
    this.fetchForms();
  }

  fetchForms = () => {
    const { searchTerm }= this.state;

    if (searchTerm) {
      axios.get(apiUrl, { params: { search: searchTerm } })
        .then(response => {
          this.setState({ data: response.data });
        })
        .catch(error => {
          console.log(error.message);
        });
    }

    axios.get(apiUrl)
      .then(response => {
        this.setState({ data: response.data });
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  createForm = async () => {
    const { form } = this.state;
    
    await axios.post(apiUrl, form)
      .then(response => {
        this.modalInsertar();
        this.fetchForms();
        this.setState({
          form: {
            code: "",
            name: "",
            description: ""
          }
        });
      })
      .catch(error => {
        if (error.response && error.response.data) {
          console.log("Error:", error.response.data);
        } else {
          console.log("Error:", error.message);
        }
      });
  }

  updateForm = () => {
    const { form, selectedFormId } = this.state;

    axios.put(apiUrl + "/" + selectedFormId, form)
      .then(response => {
        this.modalInsertar();
        this.fetchForms();
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  deleteForm = () => {
    const { selectedFormId } = this.state;

    axios.delete(apiUrl + "/" + selectedFormId)
      .then(response => {
        this.setState({ modalEliminar: false, selectedFormId: "" });
        this.fetchForms();
      })
      .catch(error => {
        console.log(error.message);
      });
  }
  

  modalInsertar = () => {
    this.setState(prevState => ({
      modalInsertar: !prevState.modalInsertar,
      tipoModal: 'insertar',
      form: {
        code: "",
        name: "",
        description: ""
      }
    }));
  }

  seleccionarFormulario = formulario => {
    axios.get(apiUrl + "/" + formulario.id)
      .then(response => {
        const selectedFormulario = response.data;
        this.setState({
          selectedFormId: formulario.id,
          tipoModal: 'actualizar',
          form: {
            id: selectedFormulario.id,
            code: selectedFormulario.code,
            name: selectedFormulario.name,
            description: selectedFormulario.description
          }
        });
      })
      .catch(error => {
        console.log(error.message);
      });
  };  

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({
      searchTerm: value
    });

    this.fetchForms();

    this.setState(prevState => ({
      form: {
        ...prevState.form,
        [name]: value
      }
    }));
  }  

  render() {
    const { form } = this.state;

    return (
      <div className="App">
        <br></br>
        <div className="header">
          <h2>Lista de Productos</h2>
            <input
              className="form-control search-input"
              type="text"
              placeholder="Buscar..."
              onKeyUp={this.handleChange}
            />
            <button className="btn btn-buscar" >Buscar</button>
            <button className="btn btn-success" onClick={() => { this.setState({ form: { code: "", name: "", description: "" }, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Descripcion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map(formulario => {
              return (
                <tr key={formulario.code}>
                  <td>{formulario.code}</td>
                  <td>{formulario.name}</td>
                  <td>{formulario.description}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarFormulario(formulario); this.modalInsertar() }}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarFormulario(formulario); this.setState({ modalEliminar: true }) }}>
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Modal isOpen={this.state.modalInsertar}>
          <ModalHeader style={{ display: 'block' }}>
            {this.state.tipoModal === 'insertar' ? 'Ingresar' : 'Editar'}
            <span style={{ float: 'right' }} onClick={() => this.modalInsertar()}>x</span>
          </ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="code">Codigo</label>
              <input className="form-control" type="text" name="code" id="code" onChange={this.handleChange} value={form.code} />
              <br />
              <label htmlFor="name">Nombre</label>
              <input className="form-control" type="text" name="name" id="name" onChange={this.handleChange} value={form.name} />
              <br />
              <label htmlFor="description">Descripcion</label>
              <input className="form-control" type="text" name="description" id="description" onChange={this.handleChange} value={form.description} />
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-success" onClick={this.state.tipoModal === 'insertar' ? this.createForm : this.updateForm}>
              {this.state.tipoModal === 'insertar' ? 'Agregar' : 'Editar'}
            </button>
            <button className="btn btn-danger" onClick={this.modalInsertar}>Cancelar</button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
            ¿Estás seguro de que deseas eliminar el formulario {form && form.name}?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={() => this.deleteForm()}>Sí</button>
            <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
          </ModalFooter>
        </Modal>

      </div>
    );
  }
}

export default App;
