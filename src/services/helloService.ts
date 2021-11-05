interface HelloService {
  getMessage: () => void;
}

const helloService: HelloService = {
  getMessage: () => {
    return { msg: "Hello." };
  },
};

export default helloService;
