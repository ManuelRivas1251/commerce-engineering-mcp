/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Pattern: IHardwareStationController
 * Docs: https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension
 */
export interface HSControllerTemplateParams {
  namespace: string;
  controllerClassName: string;
  deviceName: string;
  description: string;
}

export function renderHSController(p: HSControllerTemplateParams): string {
  return `/**
 * ${p.description}
 *
 * Pattern  : IHardwareStationController
 * Area     : Hardware Station
 * Source   : https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Docs     : https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/hardware-device-extension
 */

namespace ${p.namespace}
{
    using System;
    using System.Threading.Tasks;
    using Microsoft.Dynamics.Commerce.HardwareStation;
    using Microsoft.Dynamics.Commerce.HardwareStation.PeripheralRequests;

    /// <summary>
    /// ${p.description}
    /// </summary>
    [RoutePrefix("${p.deviceName}")]
    public class ${p.controllerClassName} : IHardwareStationController
    {
        /// <summary>
        /// Initializes a new instance of <see cref="${p.controllerClassName}"/>.
        /// </summary>
        public ${p.controllerClassName}()
        {
        }

        // TODO: Add action methods for your device operations here.
        // Example:
        //
        // [HttpPost]
        // public async Task<string> Execute(${p.deviceName}DeviceActionRequest request)
        // {
        //     ThrowIf.Null(request, nameof(request));
        //     // Implement device communication here.
        //     throw new NotImplementedException();
        // }
    }
}
`;
}
