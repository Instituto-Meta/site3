// ============================
// FIREBASE CONFIGURATION
// ============================

const firebaseConfig = {
  apiKey: "AIzaSyBBQgQf463nSvhOU85Eieb2GNwh0cvx_xc",
  authDomain: "instituto-meta-4c58e.firebaseapp.com",
  projectId: "instituto-meta-4c58e",
  storageBucket: "instituto-meta-4c58e.firebasestorage.app",
  messagingSenderId: "646204904910",
  appId: "1:646204904910:web:ef79be39e6e25de81dc79f",
  measurementId: "G-RLPBM9J1KX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

// ============================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================

function loginUsuario(email, senha) {
    return auth.signInWithEmailAndPassword(email, senha);
}

function logoutUsuario() {
    return auth.signOut();
}

function verificarAutenticacao() {
    return new Promise(function(resolve) {
        auth.onAuthStateChanged(function(user) {
            resolve(user);
        });
    });
}

// ============================
// FUNÇÕES CRUD - ALUNOS
// ============================

function adicionarAlunoFirebase(aluno) {
    return db.collection('alunos').add(aluno);
}

function buscarAlunosFirebase() {
    return db.collection('alunos').orderBy('nome').get();
}

function buscarAlunoPorCpfFirebase(cpf) {
    return db.collection('alunos').where('cpf', '==', cpf).get();
}

function atualizarAlunoFirebase(id, dados) {
    return db.collection('alunos').doc(id).update(dados);
}

function deletarAlunoFirebase(id) {
    return db.collection('alunos').doc(id).delete();
}

// ============================
// FUNÇÕES CRUD - MATÉRIAS
// ============================

function adicionarMateriaFirebase(materia) {
    return db.collection('materias').add(materia);
}

function buscarMateriasFirebase() {
    return db.collection('materias').orderBy('nome').get();
}

function atualizarMateriaFirebase(id, dados) {
    return db.collection('materias').doc(id).update(dados);
}

function deletarMateriaFirebase(id) {
    return db.collection('materias').doc(id).delete();
}

// ============================
// CRIAR MATÉRIAS PADRÃO
// Lista oficial de matérias do Instituto Meta
// ============================

const MATERIAS_PADRAO = [
    'Artes',
    'Banco de Dados',
    'Biologia',
    'Educação Física',
    'Filosofia',
    'Física',
    'Geografia',
    'História',
    'Língua Espanhola',
    'Língua Inglesa',
    'Língua Portuguesa 1',
    'Língua Portuguesa 2',
    'Matemática 1',
    'Matemática 2',
    'Meio Ambiente e Sustentabilidade',
    'Programação',
    'Projeto de Vida',
    'Química',
    'Redação',
    'Sociologia'
];

// Flag global para evitar execução paralela
let _criandoMaterias = false;

function criarMateriasPadrao() {
    // Evita rodar várias vezes em paralelo
    if (_criandoMaterias) {
        console.log('⏸️ Já está verificando matérias, aguarde...');
        return Promise.resolve();
    }

    // Evita rodar mais de uma vez na mesma sessão do navegador
    if (sessionStorage.getItem('materias_verificadas') === 'true') {
        console.log('✅ Matérias já verificadas nesta sessão.');
        return Promise.resolve();
    }

    _criandoMaterias = true;
    console.log('📚 Verificando matérias padrão...');

    return db.collection('materias').get()
        .then(function(snapshot) {
            // Normalizar nomes existentes (trim + lowercase) para comparação
            var materiasExistentes = [];
            snapshot.forEach(function(doc) {
                var nome = doc.data().nome;
                if (nome) {
                    materiasExistentes.push(nome.trim().toLowerCase());
                }
            });

            console.log('📋 Matérias existentes:', materiasExistentes.length);

            // Filtrar apenas as que NÃO existem
            var aCriar = MATERIAS_PADRAO.filter(function(nome) {
                return !materiasExistentes.includes(nome.trim().toLowerCase());
            });

            if (aCriar.length === 0) {
                console.log('✅ Todas as matérias já existem. Nada a fazer.');
                sessionStorage.setItem('materias_verificadas', 'true');
                _criandoMaterias = false;
                return;
            }

            console.log('📚 Criando ' + aCriar.length + ' matérias novas...');

            // Criar em paralelo
            var promessas = aCriar.map(function(nome) {
                return db.collection('materias').add({
                    nome: nome,
                    apostilas: [],
                    videos: [],
                    testes: [],
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function() {
                    console.log('✅ Matéria criada:', nome);
                }).catch(function(error) {
                    console.error('❌ Erro ao criar matéria:', nome, error);
                });
            });

            return Promise.all(promessas).then(function() {
                console.log('🎉 ' + aCriar.length + ' matérias adicionadas!');
                sessionStorage.setItem('materias_verificadas', 'true');
                _criandoMaterias = false;
            });
        })
        .catch(function(error) {
            console.error('❌ Erro ao verificar matérias:', error);
            _criandoMaterias = false;
        });
}

// ============================
// INICIALIZAÇÃO
// ============================

console.log('✅ Firebase configurado com sucesso!');
console.log('📁 Projeto:', firebaseConfig.projectId);