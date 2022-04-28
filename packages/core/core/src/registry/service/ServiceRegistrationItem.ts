import { Service } from "../../service/Service";
import { ServiceSettings } from "../../service/ServiceSettings";

class ServiceRegistrationItem {
  public name: string;
  public fullyQualifiedName: string;
  public settings: ServiceSettings;
  public meta?: any;
  public version?: number;
  public actions: Record<string, any>;
  public events: Record<string, any>;
  
  constructor (service: Service) {
    this.name = service.name
    this.fullyQualifiedName = service.fullyQualifiedName
    this.settings = service.settings
    this.meta = service.meta
    this.actions = {}
    this.events = {}
  }
}

export { ServiceRegistrationItem };